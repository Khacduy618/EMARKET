<?php
namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Shop;
use App\Models\AttributeValue;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
class ShopProductController extends Controller
{
    /**
     * Display a listing of the products for the authenticated user's shop.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $shop = Shop::where('UserID', Auth::id())->firstOrFail();

        $products = Product::where('ShopID', $shop->ShopID)
            ->with([
                'category:CategoryID,Name',
                'images' => function ($query) {
                    $query->orderBy('SortOrder', 'asc');
                },
                'variants' => function ($query) {
                    $query->where('IsActive', 1);
                },
            ])
            ->latest()
            ->get();

        return response()->json(['data' => $products], 200);
    }

    /**
     * Update the specified product.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProduct(Request $request, $productId)
    {
         Log::info('Update Product Request Data', [
        'all' => $request->all(),
        'files' => $request->allFiles(),
        'user' => Auth::user()
       ]);
        $validatedData = $request->validate([
            'Name' => 'required|string|max:255',
            'Description' => 'nullable|string',
            'CategoryID' => 'required|integer|exists:platformcategories,CategoryID',
            'Discount' => 'nullable|numeric|min:0|max:100',
            'ImageData' => 'required|json',
            'Images.*' => 'nullable|image|max:2048',
            'Variants' => 'required|json',
            'VariantImages.*' => 'nullable',
        ]);

        DB::beginTransaction();
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            $shop = Shop::where('UserID', $user->UserID)->firstOrFail();
            $product = Product::where('ShopID', $shop->ShopID)
                ->where('ProductID', $productId)
                ->firstOrFail();

            $variantsData = json_decode($validatedData['Variants'], true);
            $product->update([
                'Name' => $validatedData['Name'],
                'Description' => $validatedData['Description'],
                'CategoryID' => $validatedData['CategoryID'],
                'Discount' => $validatedData['Discount'] ?? 0,
                'AdminApprovalStatus' => 'Pending',
                'StockQuantity' => collect($variantsData)->sum('StockQuantity'),
            ]);

            $this->syncProductImages($request, $product);
            $this->syncProductVariantsAndAttributes($request, $product, $variantsData);

            DB::commit();
            return response()->json([
                'message' => 'Product updated successfully and is pending approval.',
                'data' => $product->load(['images', 'variants.attributeValues'])
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json(['message' => 'Product or shop not found'], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error updating product: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * Display the specified product.
     *
     * @param int $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function showProduct($productId)
    {
        try {
            $shop = Shop::where('UserID', Auth::id())->firstOrFail();
            $product = Product::where('ShopID', $shop->ShopID)
                ->with([
                    'images' => function ($query) {
                        $query->select('ImageID', 'ProductID', 'ImageURL', 'IsPrimary', 'SortOrder')
                            ->whereNull('VariantID');
                    },
                    'variants' => function ($query) {
                        $query->select('VariantID', 'ProductID', 'SKU', 'Price', 'CompareAtPrice', 'StockQuantity', 'ImageURL', 'IsActive')
                            ->with(['attributeValues' => function ($query) {
                                $query->select('attributevalues.AttributeValueID', 'attributevalues.AttributeID', 'attributevalues.Value')
                                    ->with(['attribute' => function ($query) {
                                        $query->select('AttributeID', 'Name');
                                    }]);
                            }]);
                    }
                ])
                ->select('ProductID', 'ShopID', 'CategoryID', 'Name', 'Description', 'Discount', 'StockQuantity', 'AdminApprovalStatus')
                ->findOrFail($productId);

            return response()->json(['data' => $product], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Product not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred while fetching the product: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get product attribute values.
     *
     * @param int $productID
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProductAttributeValues($productID)
    {
        try {
            if (!is_numeric($productID)) {
                return response()->json(['message' => 'Invalid product ID'], 400);
            }

            $product = Product::find($productID);
            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            $attributeValues = AttributeValue::whereIn('AttributeValueID', function ($query) use ($productID) {
                $query->select('AttributeValueID')
                    ->from('productvariantattribute')
                    ->whereIn('VariantID', function ($subQuery) use ($productID) {
                        $subQuery->select('VariantID')
                            ->from('productvariants')
                            ->where('ProductID', $productID);
                    });
            })
            ->with(['attribute' => function ($query) {
                $query->select('AttributeID', 'Name');
            }])
            ->get()
            ->groupBy('AttributeID')
            ->map(function ($group) {
                return [
                    'name' => $group->first()->attribute->Name,
                    'values' => $group->pluck('Value')->toArray()
                ];
            });

            return response()->json(['data' => $attributeValues], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching attribute values: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Delete the specified product.
     *
     * @param int $productID
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($productID)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            $shop = Shop::where('UserID', $user->UserID)->firstOrFail();
            $product = Product::where('ShopID', $shop->ShopID)->where('ProductID', $productID)->firstOrFail();

            // Delete associated images
            foreach ($product->images as $image) {
                Storage::disk('public')->delete($image->ImageURL);
                $image->delete();
            }
            // Delete associated variants and their images
            foreach ($product->variants as $variant) {
                if ($variant->ImageURL) {
                    Storage::disk('public')->delete($variant->ImageURL);
                }
                $variant->attributeValues()->detach();
                $variant->delete();
            }

            $product->delete();

            return response()->json(['message' => 'Product deleted successfully'], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Product not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error deleting product: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get attributes for a specific category.
     *
     * @param int $categoryID
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAttributes($categoryID)
    {
        if (!is_numeric($categoryID)) {
            return response()->json(['message' => 'Invalid CategoryID'], 400);
        }

        $attributes = DB::table('attributes')
            ->join('categoryattribute', 'attributes.AttributeID', '=', 'categoryattribute.AttributeID')
            ->where('categoryattribute.CategoryID', $categoryID)
            ->select('attributes.AttributeID', 'attributes.Name')
            ->orderBy('attributes.Name')
            ->get();

        return response()->json($attributes);
    }

    /**
     * Create a new product.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addProduct(Request $request)
    {
        
        $validatedData = $request->validate([
            'Name' => 'required|string|max:255',
            'Description' => 'nullable|string',
            'CategoryID' => 'required|integer|exists:platformcategories,CategoryID',
            'Discount' => 'nullable|numeric|min:0|max:100',
            'ImageData' => 'required|json',
            'Images' => 'nullable|array',
            'Images.*' => 'image|max:2048',
            'Variants' => 'required|json',
            'VariantImages.*.*' => 'image|max:2048',
        ]);
        DB::beginTransaction();
        try {
            $shop = Shop::where('UserID', Auth::id())->firstOrFail();
            $variantsData = json_decode($validatedData['Variants'], true);

            $product = Product::create([
                'ShopID' => $shop->ShopID,
                'Name' => $validatedData['Name'],
                'Description' => $validatedData['Description'],
                'CategoryID' => $validatedData['CategoryID'],
                'Discount' => $validatedData['Discount'] ?? 0,
                'AdminApprovalStatus' => 'Pending',
                'StockQuantity' => collect($variantsData)->sum('StockQuantity'),
            ]);

            $this->syncProductImages($request, $product);
            $this->syncProductVariantsAndAttribute($request, $product, $variantsData);

            DB::commit();
            return response()->json([
                'message' => 'Product added successfully and is pending approval.',
                'data' => $product->load(['images', 'variants.attributeValues'])
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json(['message' => 'Shop not found'], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error adding product: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * Sync product images.
     *
     * @param \Illuminate\Http\Request $request
     * @param \App\Models\Product $product
     * @return void
     */
    private function syncProductImages(Request $request, Product $product)
    {
        $imageData = json_decode($request->input('ImageData'), true);
        $newImageFiles = $request->file('Images', []);

        // Delete images not in the new request
        $newSortOrders = collect($imageData)->pluck('SortOrder')->toArray();
        $imagesToDelete = $product->images()->whereNotIn('SortOrder', $newSortOrders)->get();
        foreach ($imagesToDelete as $img) {
            Storage::disk('public')->delete($img->ImageURL);
            $img->delete();
        }

        // Update or create images
        foreach ($imageData as $index => $imgInfo) {
            if (isset($newImageFiles[$index])) {
                $path = $newImageFiles[$index]->store('product_images', 'public');
                ProductImage::updateOrCreate(
                    [
                        'ProductID' => $product->ProductID,
                        'SortOrder' => $imgInfo['SortOrder'],
                    ],
                    [
                        'ImageURL' => $path,
                        'IsPrimary' => $imgInfo['IsPrimary'],
                    ]
                );
            } else if (isset($imgInfo['ImageID'])) {
                ProductImage::where('ImageID', $imgInfo['ImageID'])->update([
                    'IsPrimary' => $imgInfo['IsPrimary'],
                    'SortOrder' => $imgInfo['SortOrder'],
                ]);
            }
        }
    }

   private function syncProductVariantsAndAttribute(Request $request, Product $product, array $variantsData)
{
$currentVariantIds = $product->variants()->pluck('VariantID')->toArray();
$newVariantIds = [];
$variantFiles = $request->file('VariantImages', []);

foreach ($variantsData as $index => $variantInfo) {
    // Kiểm tra SKU trùng
    if (!empty($variantInfo['SKU'])) {
        $existingVariant = ProductVariant::where('ProductID', $product->ProductID)
            ->where('SKU', $variantInfo['SKU'])
            ->where('VariantID', '!=', $variantInfo['VariantID'] ?? null)
            ->first();
        if ($existingVariant) {
            throw new \Exception("SKU '{$variantInfo['SKU']}' is already used for another variant in this product.");
        }
    }

    // Xử lý ảnh variant
    $imagePath = null;
    if (isset($variantFiles[$index]) && !empty($variantFiles[$index])) {
        $file = $variantFiles[$index];
        if (is_array($file)) {
            $file = $file[0]; // chỉ lấy ảnh đầu tiên
        }
        if ($file instanceof \Illuminate\Http\UploadedFile) {
            $imagePath = $file->store('variant_images', 'public');
        }
    }

    $variant = ProductVariant::updateOrCreate(
        [
            'ProductID' => $product->ProductID,
            'VariantID' => $variantInfo['VariantID'] ?? null,
        ],
        [
            'Price' => $variantInfo['Price'],
            'StockQuantity' => $variantInfo['StockQuantity'],
            'SKU' => $variantInfo['SKU'] ?? null,
            'CompareAtPrice' => $variantInfo['CompareAtPrice'] ?? null,
            'ImageURL' => $imagePath ?? ($variantInfo['ImageURL'] ?? null),
            'IsActive' => 1,
        ]
    );

    $newVariantIds[] = $variant->VariantID;

    // Đồng bộ Attribute Values
    $attributeValueIdsToSync = [];
    foreach ($variantInfo['AttributeValues'] as $attrID => $attrValue) {
        if (!empty($attrValue)) {
            $attributeValueRecord = AttributeValue::firstOrCreate(
                ['AttributeID' => $attrID, 'Value' => $attrValue]
            );
            $attributeValueIdsToSync[] = $attributeValueRecord->AttributeValueID;
        }
    }
    $variant->attributeValues()->sync($attributeValueIdsToSync);
}

// Xóa variant không còn
$variantsToDelete = array_diff($currentVariantIds, $newVariantIds);
if (!empty($variantsToDelete)) {
    $variants = ProductVariant::whereIn('VariantID', $variantsToDelete)->get();
    foreach ($variants as $variant) {
        if ($variant->ImageURL) {
            Storage::disk('public')->delete($variant->ImageURL);
        }
        $variant->attributeValues()->detach();
        $variant->delete();
    }
}
}

private function syncProductVariantsAndAttributes(Request $request, Product $product, array $variantsData)
{
    $currentVariantIds = $product->variants()->pluck('VariantID')->toArray();
    $newVariantIds = [];
    $variantFiles = $request->file('VariantImages', []); // Lấy mảng file ảnh

    foreach ($variantsData as $index => $variantInfo) {
        // --- Bắt đầu phần sửa logic quan trọng ---

        // 1. Tìm variant hiện có hoặc tạo mới nếu không có VariantID
        $variant = ProductVariant::findOrNew($variantInfo['VariantID'] ?? null);
        if (!$variant->exists) {
            $variant->ProductID = $product->ProductID;
        }

        // 2. Cập nhật các trường dữ liệu cơ bản
        $variant->Price = $variantInfo['Price'];
        $variant->StockQuantity = $variantInfo['StockQuantity'];
        $variant->SKU = $variantInfo['SKU'] ?? null;
        $variant->CompareAtPrice = $variantInfo['CompareAtPrice'] ?? null;
        $variant->IsActive = 1;

        // 3. Xử lý ImageURL với logic ĐÚNG
        $oldImagePath = $variant->ImageURL; // Lấy đường dẫn ảnh cũ từ DB (nếu có)

        // Case 1: CÓ ảnh mới được gửi lên cho variant này
        if (isset($variantFiles[$index]) && $variantFiles[$index] instanceof \Illuminate\Http\UploadedFile) {
            Log::info("Variant index {$index}: Có file mới. Xử lý lưu ảnh.");
            
            // Xóa ảnh cũ khỏi storage nếu có
            if ($oldImagePath && Storage::disk('public')->exists($oldImagePath)) {
                Storage::disk('public')->delete($oldImagePath);
            }
            
            // Lưu ảnh mới và cập nhật đường dẫn
            $path = $variantFiles[$index]->store('variant_images', 'public');
            $variant->ImageURL = $path;
        }
        // Case 2: KHÔNG có ảnh mới, nhưng FE báo "giữ lại ảnh cũ"
        // Chú ý: dùng đúng key 'existingImageUrl' mà FE gửi
        elseif (!empty($variantInfo['existingImageUrl'])) {
            Log::info("Variant index {$index}: Không có file mới, FE yêu cầu giữ lại ảnh '{$variantInfo['existingImageUrl']}'. Không làm gì.");
            // Không làm gì cả, giữ nguyên giá trị $variant->ImageURL hiện tại
        }
        // Case 3: KHÔNG có ảnh mới VÀ cũng KHÔNG giữ lại (tức là người dùng đã xóa ảnh trên FE)
        else {
            Log::info("Variant index {$index}: Không có file mới và không có existingImageUrl. Xóa ảnh cũ.");

            // Xóa ảnh cũ khỏi storage nếu có
            if ($oldImagePath && Storage::disk('public')->exists($oldImagePath)) {
                Storage::disk('public')->delete($oldImagePath);
            }
            // Cập nhật đường dẫn là null trong DB
            $variant->ImageURL = null;
        }

        // 4. Lưu lại variant sau khi đã xử lý xong
        $variant->save();

        // 5. Thêm ID của variant vừa xử lý vào danh sách để giữ lại
        $newVariantIds[] = $variant->VariantID;

        // 6. Đồng bộ Attribute Values (giữ nguyên logic cũ của bạn)
        $attributeValueIdsToSync = [];
        if (!empty($variantInfo['AttributeValues'])) {
            foreach ($variantInfo['AttributeValues'] as $attrID => $attrValue) {
                if (!empty($attrValue)) {
                    $attributeValueRecord = AttributeValue::firstOrCreate(
                        ['AttributeID' => $attrID, 'Value' => $attrValue]
                    );
                    $attributeValueIdsToSync[] = $attributeValueRecord->AttributeValueID;
                }
            }
        }
        $variant->attributeValues()->sync($attributeValueIdsToSync);

        // --- Kết thúc phần sửa logic ---
    }

    // Xóa các variant không còn tồn tại (giữ nguyên logic cũ của bạn)
    $variantsToDeleteIds = array_diff($currentVariantIds, $newVariantIds);
    if (!empty($variantsToDeleteIds)) {
        $variantsToDelete = ProductVariant::whereIn('VariantID', $variantsToDeleteIds)->get();
        foreach ($variantsToDelete as $variant) {
            if ($variant->ImageURL) {
                Storage::disk('public')->delete($variant->ImageURL);
            }
            $variant->attributeValues()->detach();
            $variant->delete();
        }
    }
}

        public function showAllProducts()
        {
            try {
                // Lấy tất cả sản phẩm (toàn sàn) chỉ những cái đã approved
                $products = Product::with([
                        'images' => function ($query) {
                            $query->select('ImageID', 'ProductID', 'ImageURL', 'IsPrimary', 'SortOrder')
                                ->whereNull('VariantID');
                        },
                        'variants' => function ($query) {
                            $query->select('VariantID', 'ProductID', 'SKU', 'Price', 'CompareAtPrice', 'StockQuantity', 'ImageURL', 'IsActive')
                                ->with(['attributeValues' => function ($query) {
                                    $query->select('attributevalues.AttributeValueID', 'attributevalues.AttributeID', 'attributevalues.Value')
                                        ->with(['attribute' => function ($query) {
                                            $query->select('AttributeID', 'Name');
                                        }]);
                                }]);
                        }
                    ])
                    ->select('ProductID', 'ShopID', 'CategoryID', 'Name', 'Description', 'Discount', 'StockQuantity', 'AdminApprovalStatus')
            ->where('AdminApprovalStatus', 'Approved')  
            ->get();


        return response()->json(['data' => $products], 200);
    } catch (\Exception $e) {
        return response()->json(['message' => 'An error occurred while fetching products: ' . $e->getMessage()], 500);
    }
}

  

}