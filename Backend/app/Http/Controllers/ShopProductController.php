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
use App\Http\Requests\StoreProductRequest;  
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
     // Thay thế hàm addProduct cũ bằng hàm này

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