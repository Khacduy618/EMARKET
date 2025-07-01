<?php

namespace App\Http\Controllers;

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
   

    /**
     * Display the specified product.
     *
     * @param int $productId
     * @return \Illuminate\Http\JsonResponse
     */
   

   
    public function getProductAttributeValues($productID)
    {
        try {
            if (!is_numeric($productID)) {
                return response()->json(['message' => 'ID sản phẩm không hợp lệ'], 400);
            }

            $product = Product::find($productID);
            if (!$product) {
                return response()->json(['message' => 'Sản phẩm không tồn tại'], 404);
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
            ->get()
            ->groupBy('AttributeID')
            ->map(function ($group) {
                return $group->pluck('Value')->toArray();
            });

            return response()->json(['data' => $attributeValues], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi khi lấy giá trị thuộc tính: ' . $e->getMessage()], 500);
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
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $shop = Shop::where('UserID', $user->UserID)->firstOrFail();
        $product = Product::where('ShopID', $shop->ShopID)->where('ProductID', $productID)->firstOrFail();

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully'], 200);
    }

    /**
     * Get attributes for a specific category.
     *
     * @param int $categoryID
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAttributes($categoryID)
    {
        if (!$categoryID) {
            return response()->json(['message' => 'CategoryID is required'], 400);
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
    // Bước 1: Validation
    // Validate các trường cơ bản trước
    $validatedData = $request->validate([
        'Name' => 'required|string|max:255',
        'Description' => 'nullable|string',
        'CategoryID' => 'required|integer|exists:platformcategories,CategoryID',
        'Discount' => 'nullable|numeric|min:0|max:100',
        'ImageData' => 'required|json', // Metadata cho ảnh chính
        'Images' => 'nullable|array',
        'Images.*' => 'image|max:2048',
        'Variants' => 'required|json', // Dữ liệu các variants dưới dạng chuỗi JSON
        'AttributeValues' => 'required|json', // Dữ liệu các thuộc tính dưới dạng chuỗi JSON
    ]);

    // Validate các file ảnh của variant (nếu có)
    $request->validate([
        'VariantImages.*' => 'nullable|array',
        'VariantImages.*.*' => 'image|max:2048', // Mỗi phần tử trong mảng con phải là ảnh
    ]);

    // Sử dụng transaction để đảm bảo an toàn dữ liệu
    DB::beginTransaction();
    try {
        $shop = Shop::where('UserID', Auth::id())->firstOrFail();
        $variantsData = json_decode($validatedData['Variants'], true);
        $attributeValuesData = json_decode($validatedData['AttributeValues'], true);
        
        // --- 2. Tạo sản phẩm chính ---
        $product = Product::create([    
            'ShopID' => $shop->ShopID,
            'Name' => $validatedData['Name'],
            'Description' => $validatedData['Description'],
            'CategoryID' => $validatedData['CategoryID'],
            'discount' => $validatedData['Discount'] ?? 0,
            'AdminApprovalStatus' => 'Pending',
            // Tổng tồn kho sẽ được tính sau khi tạo variants
            'StockQuantity' => collect($variantsData)->sum('StockQuantity'),
        ]);

        // --- 3. Lưu ảnh chính của sản phẩm ---
        $imageData = json_decode($validatedData['ImageData'], true);
        if ($request->hasFile('Images')) {
            foreach ($request->file('Images') as $index => $file) {
                $path = $file->store('product_images', 'public');
                ProductImage::create([
                    'ProductID' => $product->ProductID,
                    'ImageURL' => $path, // Lưu đường dẫn tương đối
                    'IsPrimary' => $imageData[$index]['IsPrimary'] ?? ($index === 0),
                    'SortOrder' => $imageData[$index]['SortOrder'] ?? $index,
                ]);
            }
        }
        
        // --- 4. Xử lý và tạo các Variants ---
        $variantFiles = $request->file('VariantImages', []);

        foreach ($variantsData as $index => $variantInfo) {
            // Tạo bản ghi variant trước
            $variant = ProductVariant::create([
                'ProductID' => $product->ProductID,
                'Price' => $variantInfo['Price'],
                'StockQuantity' => $variantInfo['StockQuantity'],
                'SKU' => $variantInfo['SKU'],
                'CompareAtPrice' => $variantInfo['CompareAtPrice'] ?? null,
                'ImageURL' => null, // Sẽ cập nhật sau nếu có ảnh chính
                'IsActive' => 1,
            ]);

            // Xử lý ảnh cho variant này (nếu có)
            if (isset($variantFiles[$index]) && !empty($variantFiles[$index])) {
                foreach ($variantFiles[$index] as $imageIndex => $imageFile) {
                    $path = $imageFile->store('variant_images', 'public');
                    // Ảnh đầu tiên của variant được set làm ảnh đại diện cho variant đó
                    if ($imageIndex === 0) {
                        $variant->update(['ImageURL' => $path]);
                    }
                    // TODO: Nếu bạn có bảng riêng cho ảnh của variant, hãy tạo bản ghi ở đây
                    // Ví dụ: VariantImage::create(['VariantID' => $variant->VariantID, 'ImageURL' => $path]);
                }
            }

            // Gắn các giá trị thuộc tính vào variant
            foreach($attributeValuesData as $attrID => $attrValue) {
                if (!empty($attrValue)) {
                    $attributeValueRecord = AttributeValue::firstOrCreate(
                        ['AttributeID' => $attrID, 'Value' => $attrValue]
                    );
                    $variant->attributeValues()->attach($attributeValueRecord->AttributeValueID);
                }
            }
        }

        DB::commit();
        return response()->json(['message' => 'Sản phẩm đã được thêm và đang chờ phê duyệt.', 'data' => $product->load('images', 'variants')], 201);

    } catch (\Exception $e) {
        DB::rollBack();
        // Trả về lỗi chi tiết hơn để debug
        return response()->json([
            'message' => 'Lỗi khi thêm sản phẩm: ' . $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ], 500);
    }
}
public function updateProduct(Request $request, Product $product)
    {
        // 1. VALIDATION
        $validatedData = $request->validate([
            'Name' => 'required|string|max:255',
            'Description' => 'nullable|string',
            'CategoryID' => 'required|integer|exists:platformcategories,CategoryID',
            'Discount' => 'nullable|numeric|min:0|max:100',
            'ImageData' => 'required|json', // Metadata cho ảnh chính
            'Images' => 'nullable|array',
            'Images.*' => 'image|max:2048', // Ảnh mới tải lên
            'Variants' => 'required|json', // Dữ liệu các variants
            'AttributeValues' => 'required|json', // Dữ liệu các thuộc tính
            'VariantImages.*' => 'nullable|array',
            'VariantImages.*.*' => 'image|max:2048',
        ]);

        // 2. AUTHORIZATION
        $shop = Auth::user()->shop;
        if ($product->ShopID !== $shop->ShopID) {
            return response()->json(['message' => 'Bạn không có quyền chỉnh sửa sản phẩm này.'], 403);
        }

        // 3. DATABASE TRANSACTION
        DB::beginTransaction();
        try {
            // Decode JSON data từ request
            $variantsData = json_decode($validatedData['Variants'], true);
            $attributeValuesData = json_decode($validatedData['AttributeValues'], true);

            // 4. CẬP NHẬT THÔNG TIN SẢN PHẨM CHÍNH
            $product->update([
                'Name' => $validatedData['Name'],
                'Description' => $validatedData['Description'],
                'CategoryID' => $validatedData['CategoryID'],
                'discount' => $validatedData['Discount'] ?? 0,
                'AdminApprovalStatus' => 'Pending', // Đặt lại trạng thái chờ duyệt
                'StockQuantity' => collect($variantsData)->sum('StockQuantity'), // Tính lại tổng tồn kho
            ]);

            // 5. XỬ LÝ HÌNH ẢNH SẢN PHẨM (THÊM/SỬA/XÓA)
            $this->syncProductImages($request, $product);

            // 6. XỬ LÝ PHÂN LOẠI & THUỘC TÍNH (THÊM/SỬA/XÓA)
            $this->syncProductVariantsAndAttributes($request, $product, $variantsData, $attributeValuesData);

            // Nếu mọi thứ thành công, commit transaction
            DB::commit();

            return response()->json([
                'message' => 'Sản phẩm đã được cập nhật và đang chờ phê duyệt.',
                'data' => $product->load('images', 'variants.attributeValues')
            ], 200);

        } catch (\Exception $e) {
            // Nếu có lỗi, rollback tất cả thay đổi
            DB::rollBack();
            Log::error('Product Update Failed', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return response()->json(['message' => 'Lỗi khi cập nhật sản phẩm. Vui lòng thử lại.'], 500);
        }
    }

    /**
     * Hàm private để đồng bộ hóa hình ảnh sản phẩm
     */
    private function syncProductImages(Request $request, Product $product)
    {
        $imageData = json_decode($request->input('ImageData'), true);
        $newImageFiles = $request->file('Images', []);
        
        $currentImageIds = $product->images()->pluck('ImageID')->toArray();
        $submittedImageIds = collect($imageData)->pluck('ImageID')->filter()->values()->toArray();

        // A. Xóa những ảnh không còn trong danh sách gửi lên
        $imagesToDeleteIds = array_diff($currentImageIds, $submittedImageIds);
        if (!empty($imagesToDeleteIds)) {
            $imagesToDelete = ProductImage::whereIn('ImageID', $imagesToDeleteIds)->get();
            foreach ($imagesToDelete as $img) {
                Storage::disk('public')->delete($img->ImageURL);
                $img->delete();
            }
        }

        // B. Cập nhật ảnh cũ và thêm ảnh mới
        $newFileIndex = 0;
        foreach ($imageData as $imgInfo) {
            if (isset($imgInfo['ImageID'])) {
                // Ảnh đã tồn tại -> Cập nhật
                ProductImage::where('ImageID', $imgInfo['ImageID'])->update([
                    'IsPrimary' => $imgInfo['IsPrimary'],
                    'SortOrder' => $imgInfo['SortOrder'],
                ]);
            } else {
                // Ảnh mới -> Tạo mới
                if (isset($newImageFiles[$newFileIndex])) {
                    $path = $newImageFiles[$newFileIndex]->store('product_images', 'public');
                    $product->images()->create([
                        'ImageURL' => $path,
                        'IsPrimary' => $imgInfo['IsPrimary'],
                        'SortOrder' => $imgInfo['SortOrder'],
                    ]);
                    $newFileIndex++;
                }
            }
        }
    }

    /**
     * Hàm private để đồng bộ hóa phân loại và thuộc tính
     */
    private function syncProductVariantsAndAttributes(Request $request, Product $product, array $variantsData, array $attributeValuesData)
    {
        $currentVariantIds = $product->variants()->pluck('VariantID')->toArray();
        $submittedVariantIds = collect($variantsData)->pluck('VariantID')->filter()->values()->toArray();

        // A. Xóa những variant không còn trong danh sách gửi lên
        $variantsToDeleteIds = array_diff($currentVariantIds, $submittedVariantIds);
        if (!empty($variantsToDeleteIds)) {
            $variantsToDelete = ProductVariant::whereIn('VariantID', $variantsToDeleteIds)->get();
            foreach ($variantsToDelete as $variant) {
                $variant->attributeValues()->detach(); // Xóa quan hệ ở bảng trung gian
                // Xóa ảnh của variant nếu có
                if($variant->ImageURL){
                    Storage::disk('public')->delete($variant->ImageURL);
                }
                $variant->delete();
            }
        }

        // B. Cập nhật và tạo mới các variant
        $variantFiles = $request->file('VariantImages', []);
        foreach ($variantsData as $index => $variantInfo) {
            $variant = ProductVariant::updateOrCreate(
                ['VariantID' => $variantInfo['VariantID'] ?? null, 'ProductID' => $product->ProductID],
                [
                    'Price' => $variantInfo['Price'],
                    'StockQuantity' => $variantInfo['StockQuantity'],
                    'SKU' => $variantInfo['SKU'],
                    'CompareAtPrice' => $variantInfo['CompareAtPrice'] ?? null,
                    'IsActive' => 1,
                ]
            );

            // Cập nhật ảnh cho variant nếu có file mới
            if (isset($variantFiles[$index]) && !empty($variantFiles[$index])) {
                // Xóa ảnh cũ nếu có
                if ($variant->ImageURL) {
                    Storage::disk('public')->delete($variant->ImageURL);
                }
                $path = $variantFiles[$index][0]->store('variant_images', 'public');
                $variant->update(['ImageURL' => $path]);
            }

            // C. Đồng bộ hóa thuộc tính cho variant này
            $attributeValueIdsToSync = [];
            foreach ($attributeValuesData as $attrID => $attrValue) {
                if (!empty($attrValue)) {
                    $attributeValueRecord = AttributeValue::firstOrCreate(
                        ['AttributeID' => $attrID, 'Value' => $attrValue]
                    );
                    $attributeValueIdsToSync[] = $attributeValueRecord->AttributeValueID;
                }
            }
            // Sync sẽ tự động thêm, xóa, cập nhật các quan hệ trong bảng trung gian
            $variant->attributeValues()->sync($attributeValueIdsToSync);
        }
    }

    
    public function showProduct($productId)
    {
        try {
            // Lấy shop của người dùng hiện tại
            $shop = Shop::where('UserID',  Auth::id() )->firstOrFail();

            // Tìm sản phẩm thuộc shop hiện tại
            $product = Product::where('ShopID', $shop->ShopID)
                ->with([
                    'images' => function ($query) {
                        $query->select('ImageID', 'ProductID', 'ImageURL', 'IsPrimary', 'SortOrder');
                    },
                    'variants' => function ($query) {
                        $query->select('VariantID', 'ProductID', 'SKU', 'Price', 'CompareAtPrice', 'StockQuantity', 'ImageURL', 'IsActive')
                            ->with(['attributeValues' => function ($query) {
                                $query->select('attributevalues.AttributeValueID', 'attributevalues.AttributeID', 'attributevalues.Value');
                            }]);
                    }
                    // Loại bỏ 'attributeValues' trực tiếp nếu không cần
                ])
                ->select('ProductID', 'ShopID', 'CategoryID', 'Name', 'Description', 'Discount', 'StockQuantity', 'AdminApprovalStatus')
                ->findOrFail($productId);

            return response()->json([
                'data' => $product,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Product not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while fetching the product: ' . $e->getMessage(),
            ], 500);
        }
    }
}