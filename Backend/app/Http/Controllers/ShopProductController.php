<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Shop;
use App\Models\Attribute;
use App\Models\ShopCategory;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreProductRequest;  
use App\Models\AttributeValue;
use Illuminate\Support\Facades\Storage;
class ShopProductController extends Controller
{
    public function index()
    {
        // Sử dụng Auth::id() để lấy ID user đang đăng nhập, an toàn hơn.
        $shop = Shop::where('UserID', Auth::id())->firstOrFail();

        // Eager-load các quan hệ cần thiết cho trang danh sách sản phẩm.
        // Điều này giúp giảm số lượng truy vấn đến database.
        $products = Product::where('ShopID', $shop->ShopID)
            ->with([
                // Lấy thông tin cơ bản của category
                'category:CategoryID,Name', 
                
                // Lấy tất cả hình ảnh, sắp xếp theo thứ tự
                'images' => function ($query) {
                    $query->orderBy('SortOrder', 'asc');
                },

                // Lấy tất cả các biến thể đang hoạt động
                'variants' => function ($query) {
                    $query->where('IsActive', 1);
                }
            ])
            ->latest() // Sắp xếp sản phẩm mới nhất lên đầu
            ->get();

        // Trả về collection $products trực tiếp. 
        // Laravel sẽ tự động chuyển đổi nó và các quan hệ đã load thành JSON.
        // Mỗi đối tượng product trong JSON sẽ có các key 'category', 'images', 'variants'.
        return response()->json(['data' => $products], 200);
    }


      /**
     * Lưu một sản phẩm mới vào kho.
     *
     * @param  \App\Http\Requests\StoreProductRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addProduct(Request $request)
    {
        try {
            $shop = Shop::where('UserID', Auth::id())->firstOrFail();
            $shopID = $shop->ShopID;
            $validatedData = $request->validate([
                'Name' => 'required|string|max:255',
                'Description' => 'nullable|string',
                'CategoryID' => 'required|integer|exists:shopcategories,CategoryID',
                'Discount' => 'nullable|numeric|min:0|max:100',
                'Variants' => 'required|string', // Changed to string to accept JSON
                'Images' => 'nullable|array',
                'Images.*' => 'image|max:2048',
                'ImageData' => 'required|json',
            ]);

            $product = Product::create([    
                'ShopID' => $shopID,
                'Name' => $validatedData['Name'],
                'Description' => $validatedData['Description'],
                'CategoryID' => $validatedData['CategoryID'],
                'Discount' => $validatedData['Discount'] ?? 0,
                'Status' => 'pending',
                'StockQuantity' => 0  ,
            ]);

            $imageData = json_decode($validatedData['ImageData'], true);
            $images = $request->file('Images', []);
            foreach ($imageData as $index => $data) {
                if (isset($images[$index])) {
                    $path = $images[$index]->store('product_images', 'public');
                    ProductImage::create([
                        'ProductID' => $product->ProductID,
                        'ImageURL' => Storage::url($path),
                        'IsPrimary' => $data['IsPrimary'] ?? false,
                        'SortOrder' => $data['SortOrder'] ?? $index,
                    ]);
                }
            }

            // Decode Variants from JSON string
            $variantsData = json_decode($validatedData['Variants'], true);
            if (!is_array($variantsData)) {
                throw new \Exception('Invalid variants data format.');
            }

            $variantImages = $request->file('VariantImages', []);
            foreach ($variantsData as $index => $variantData) {
                $imageUrl = null;
                if (isset($variantImages[$index]) && !empty($variantImages[$index])) {
                    $firstImage = $variantImages[$index][0]; // Take the first image for ImageURL
                    $path = $firstImage->store('variant_images', 'public');
                    $imageUrl = Storage::url($path);
                }

                $variant = ProductVariant::create([
                    'ProductID' => $product->ProductID,
                    'Price' => $variantData['Price'],
                    'StockQuantity' => $variantData['StockQuantity'],
                    'SKU' => $variantData['SKU'],
                    'CompareAtPrice' => $variantData['CompareAtPrice'] ?? null,
                    'ImageURL' => $imageUrl, // Add the first image URL
                ]);

                // Handle additional images for this variant
                if (isset($variantImages[$index]) && count($variantImages[$index]) > 1) {
                    foreach (array_slice($variantImages[$index], 1) as $imageFile) {
                        $path = $imageFile->store('variant_images', 'public');
                        ProductImage::create([
                            'VariantID' => $variant->VariantID,
                            'ImageURL' => Storage::url($path),
                            'IsPrimary' => false, // Adjust logic if needed
                            'SortOrder' => 0,    // Adjust logic if needed
                        ]);
                    }
                }
            }

            return response()->json(['message' => 'Sản phẩm đã được thêm và đang chờ phê duyệt.', 'data' => $product], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi khi thêm sản phẩm: ' . $e->getMessage()], 500);
        }
    }
    // trong app/Http/Controllers/ShopProductController.php

// ... (sau hàm store)

/**
 * Hiển thị thông tin chi tiết của một sản phẩm để chỉnh sửa.
 * @param \App\Models\Product $product
 * @return \Illuminate\Http\JsonResponse
 */
public function show($productId)
{
    $product = Product::find($productId);

    if (!$product) {
        return response()->json(['message' => 'Product not found'], 404);
    }

    // if ($product->ShopID != Auth::user()->shop->ShopID) {
    //     return response()->json(['message' => 'Unauthorized'], 403);
    // }

    $product->load(['images', 'variants.attributeValues.attribute', 'category']);
    

    return response()->json(['data' => $product], 200);
}



/**
 * Cập nhật sản phẩm trong kho.
 * @param \App\Http\Requests\UpdateProductRequest $request // Tạo FormRequest mới
 * @param \App\Models\Product $product
 * @return \Illuminate\Http\JsonResponse
 */
public function update(Request $request, Product $product) // Tạm dùng Request, nên tạo UpdateProductRequest
{
    // Tương tự hàm show, cần kiểm tra quyền sở hữu sản phẩm
    // $this->authorize('update', $product);

    // Bắt đầu transaction
    DB::beginTransaction();
    try {
        // --- Cập nhật thông tin cơ bản của Product ---
        $product->update([
            'CategoryID' => $request->CategoryID,
            'Name' => $request->Name,
            'Description' => $request->Description,
            'discount' => $request->Discount,
            // ... các trường khác
        ]);

        // --- Xử lý Ảnh ---
        // 1. Xóa các ảnh được đánh dấu để xóa
        $imagesToDelete = json_decode($request->input('imagesToDelete', '[]'), true);
        if (!empty($imagesToDelete)) {
            $images = ProductImage::whereIn('ImageID', $imagesToDelete)->where('ProductID', $product->ProductID)->get();
            foreach ($images as $image) {
                Storage::disk('public')->delete($image->ImageURL);
                $image->delete();
            }
        }
        
        // 2. Thêm các ảnh mới
        if ($request->hasFile('newImages')) {
            $newImageData = json_decode($request->input('newImageData', '[]'), true);
            foreach ($request->file('newImages') as $index => $file) {
                // ... (logic lưu file và tạo ProductImage như hàm store)
            }
        }
        
        // --- Xử lý Variants (Phần này phức tạp hơn) ---
        // Logic đơn giản: Xóa hết variants cũ và tạo lại.
        // Logic nâng cao: So sánh variants cũ và mới để update, create, delete.
        // Tạm thời dùng logic đơn giản:
        $product->variants()->delete(); // Cẩn thận: nên là soft delete nếu có

        if ($request->filled('Variants')) {
            // ... (copy logic tạo variant từ hàm store)
        }
        
        DB::commit();
        return response()->json(['message' => 'Product updated successfully!', 'data' => $product->fresh()->load('images', 'variants')], 200);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json(['message' => 'Failed to update product', 'error' => $e->getMessage()], 500);
    }
}

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

        // Fetch attribute values grouped by AttributeID
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
}