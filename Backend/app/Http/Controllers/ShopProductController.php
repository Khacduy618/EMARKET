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
    public function store(StoreProductRequest $request)
    {
        // Bắt đầu transaction ngay từ đầu để bao bọc cả việc lưu ảnh
        DB::beginTransaction();
        try {
            // --- 1. Kiểm tra các điều kiện ban đầu ---
            $shop = Shop::where('UserID', Auth::id())->firstOrFail();
            $isCategoryRegistered = ShopCategory::where('ShopID', $shop->ShopID)
                                              ->where('CategoryID', $request->CategoryID)
                                              ->exists();
            if (!$isCategoryRegistered) {
                throw new \Exception('This category is not registered for your shop.', 403);
            }

            // --- 2. Tạo Product và Variants (Phần đã hoạt động tốt) ---
            $product = Product::create([
                'ShopID' => $shop->ShopID,
                'CategoryID' => $request->CategoryID,
                'Name' => $request->Name,
                'Description' => $request->Description,
                'discount' => $request->Discount,
                'StockQuantity' => $request->filled('Variants') ? collect($request->Variants)->sum('StockQuantity') : $request->StockQuantity,
                'IsActive' => 1,
                'AdminApprovalStatus' => 'Pending',
            ]);

            if ($request->filled('Variants')) {
                foreach ($request->Variants as $variantData) {
                    $variant = $product->variants()->create([
                        'SKU' => $variantData['SKU'], 'Price' => $variantData['Price'],
                        'StockQuantity' => $variantData['StockQuantity'], 'IsActive' => 1,
                    ]);
                    if (!empty($variantData['AttributeValues'])) {
                        foreach ($variantData['AttributeValues'] as $attrValueData) {
                            $attributeValue = AttributeValue::firstOrCreate(['AttributeID' => $attrValueData['AttributeID'], 'Value' => $attrValueData['Value']]);
                            $variant->attributeValues()->attach($attributeValue->AttributeValueID);
                        }
                    }
                }
            } else {
                 $product->variants()->create(['SKU' => $request->SKU, 'Price' => $request->Price, 'StockQuantity' => $request->StockQuantity, 'IsActive' => 1]);
            }

            // --- 3. THÊM LẠI KHỐI XỬ LÝ HÌNH ẢNH ---
            if ($request->hasFile('Images')) {
                $imageData = $request->ImageData;
                foreach ($request->file('Images') as $index => $file) {
                    $filename = $product->ProductID . '_' . time() . '_' . $index . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('images/products', $filename, 'public');
                    
                    ProductImage::create([
                        'ProductID' => $product->ProductID,
                        'ImageURL' => $path, // Lưu đường dẫn tương đối
                        'IsPrimary' => $imageData[$index]['IsPrimary'],
                        'SortOrder' => $imageData[$index]['SortOrder'],
                    ]);
                }
            }
            
            // Nếu mọi thứ thành công, commit transaction
            DB::commit();

            return response()->json(['message' => 'Product created successfully!'], 201);

        } catch (\Exception $e) {
            // Rollback lại transaction nếu có bất kỳ lỗi nào
            DB::rollBack();
            
            // Trả về lỗi chi tiết
            $statusCode = method_exists($e, 'getCode') && $e->getCode() ? $e->getCode() : 500;
            if ($statusCode < 100 || $statusCode >= 600) $statusCode = 500;
            
            return response()->json([
                'message' => $e->getMessage() ?: 'An error occurred while creating the product.',
                'error_details' => [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ],
            ], $statusCode);
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