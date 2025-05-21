<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
{
    $products = DB::table('products')
        ->leftJoin('productimages', 'products.ProductID', '=', 'productimages.ProductID')
        ->select('products.*', 'productimages.ImageURL')
        ->where('productimages.IsPrimary', 1)
        ->get();

    return response()->json($products);
}
    public function store(Request $request)
    {
        try {
        // Validate dữ liệu đầu vào
        $request->validate([
            'ShopID' => 'required|integer|exists:shops,ShopID',
            'CategoryID' => 'required|integer|exists:platformcategories,CategoryID',
            'Name' => 'required|string|max:255',
            'Description' => 'nullable|string',
            'SKU' => 'nullable|string|max:100|unique:products,SKU',
            'Price' => 'required|numeric|min:0',
            'StockQuantity' => 'required|integer|min:0',
            'IsActive' => 'required|boolean',
            'AdminApprovalStatus' => 'required|in:Pending,Approved,Rejected',
            'ReasonForRejection' => 'nullable|string',
            'AverageRating' => 'nullable|numeric|min:0|max:5',
            'ViewCount' => 'nullable|integer|min:0',
            'SoldCount' => 'nullable|integer|min:0',
        ], [
            'SKU.unique' => 'Mã SKU đã được sử dụng, vui lòng chọn mã khác.',
        ]);

        // Tạo product mới
        $product = Product::create([
            'ShopID' => $request->ShopID,
            'CategoryID' => $request->CategoryID,
            'Name' => $request->Name,
            'Description' => $request->Description,
            'SKU' => $request->SKU,
            'Price' => $request->Price,
            'StockQuantity' => $request->StockQuantity,
            'IsActive' => $request->IsActive,
            'AdminApprovalStatus' => $request->AdminApprovalStatus,
            'ReasonForRejection' => $request->ReasonForRejection,
            'AverageRating' => $request->AverageRating ?? 0,
            'ViewCount' => $request->ViewCount ?? 0,
            'SoldCount' => $request->SoldCount ?? 0,
        ]);


            
            return response()->json([
                'status' => 'success',
                'message' => 'Thêm sản phẩm thành công',
                'data' => $product,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi thêm sản phẩm: ' . $e->getMessage(),
            ], 500);
        }
    }
    public function update(Request $request, $id)
{
    try {
        $product = Product::findOrFail($id);

        $request->validate([
            'ShopID' => 'sometimes|integer|exists:shops,ShopID',
            'CategoryID' => 'sometimes|integer|exists:platformcategories,CategoryID',
            'Name' => 'sometimes|string|max:255',
            'Description' => 'nullable|string',
            'SKU' => 'sometimes|string|max:100|unique:products,SKU,' . $id . ',ProductID',
            'Price' => 'sometimes|numeric|min:0',
            'StockQuantity' => 'sometimes|integer|min:0',
            'IsActive' => 'sometimes|boolean',
            'AdminApprovalStatus' => 'sometimes|in:Pending,Approved,Rejected',
            'ReasonForRejection' => 'nullable|string',
            'AverageRating' => 'nullable|numeric|min:0|max:5',
            'ViewCount' => 'nullable|integer|min:0',
            'SoldCount' => 'nullable|integer|min:0',
        ]);

        $product->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Cập nhật sản phẩm thành công',
            'data' => $product,
        ]);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Không tìm thấy sản phẩm',
        ], 404);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Lỗi khi cập nhật sản phẩm: ' . $e->getMessage(),
        ], 500);
    }
}
public function destroy($id)
{
    try {
        $product = Product::findOrFail($id);

        // Kiểm tra sản phẩm có CategoryID hợp lệ (hoặc kiểm tra điều kiện liên quan)
        if ($product->CategoryID) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không thể xóa sản phẩm này vì nó vẫn thuộc một danh mục.',
            ], 400);
        }

        // Nếu muốn kiểm tra quan hệ khác, bạn có thể thêm logic ở đây
        // Ví dụ: nếu product có đơn hàng liên quan thì cũng không xóa được

        $product->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Xóa sản phẩm thành công',
        ]);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Không tìm thấy sản phẩm',
        ], 404);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Lỗi khi xóa sản phẩm: ' . $e->getMessage(),
        ], 500);
    }
}
public function ProductFinalPrice()
{
    $products = Product::where('discount', '>', 0)
        ->get(['name','price', 'discount', 'AverageRating']);

    return response()->json($products);
}
public function bestSelling()
{
    $products = DB::table('products')
        ->leftJoin('productimages', function ($join) {
            $join->on('products.ProductID', '=', 'productimages.ProductID')
                 ->where('productimages.IsPrimary', '=', 1);
        })
        ->where('products.IsActive', 1)
        ->where('products.AdminApprovalStatus', 'Approved')
        ->orderByDesc('products.SoldCount')
        ->limit(4)
        ->select(
            'products.ProductID',
            'products.Name',
            'products.Price',
            'products.discount',
            'products.AverageRating',
            'products.SoldCount',
            'products.ViewCount',
            'productimages.ImageURL'
        )
        ->get();

    return response()->json($products);
}

}