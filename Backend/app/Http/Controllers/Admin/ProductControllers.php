<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductControllers extends Controller
{
  public function index(Request $request)
  {
    $query = Product::with('category');

    // Tìm kiếm theo tên sản phẩm
    if ($request->filled('keyword')) {
      $query->where('Name', 'like', '%' . $request->keyword . '%');
    }

    // Lọc theo trạng thái phê duyệt
    if ($request->filled('approval_status')) {
      $query->where('AdminApprovalStatus', $request->approval_status);
    }

    // Lọc theo trạng thái ẩn/hiện
    if ($request->has('is_active')) {
      $query->where('IsActive', (bool) $request->is_active);
    }

    // Nếu lọc theo tên danh mục hoặc sắp xếp theo tên danh mục
    if ($request->filled('category_name') || $request->get('sort_by') === 'category_name') {
      $query->leftJoin('platformcategories', 'products.CategoryID', '=', 'platformcategories.CategoryID');
      $query->select('products.*');

      if ($request->filled('category_name')) {
        $categoryId = (int) $request->category_name;
        $query->where('platformcategories.CategoryID', $categoryId);
      }
    }

    // Sắp xếp
    $sortBy = $request->get('sort_by', 'CreatedAt');
    $sortOrder = $request->get('sort_order', 'desc');

    $allowedSorts = ['CreatedAt', 'Name', 'SoldCount', 'ViewCount', 'Price', 'category_name'];
    if (!in_array($sortBy, $allowedSorts)) {
      $sortBy = 'CreatedAt';
    }
    if (!in_array(strtolower($sortOrder), ['asc', 'desc'])) {
      $sortOrder = 'desc';
    }

    if ($sortBy === 'category_name') {
      $query->orderBy('platformcategories.Name', $sortOrder);
    } else {
      $query->orderBy($sortBy, $sortOrder);
    }

    // Phân trang
    $perPage = $request->get('per_page', 10);
    $products = $query->paginate($perPage);

    return response()->json([
      'status' => true,
      'message' => 'Danh sách sản phẩm',
      'data' => $products
    ]);
  }




  public function updateApprovalStatus(Request $request, $id)
  {
    $product = Product::findOrFail($id);
    $request->validate([
      'status' => 'required|in:Pending,Approved,Rejected'
    ]);

    $product->AdminApprovalStatus = $request->status;
    $product->save();

    return response()->json(['status' => true, 'message' => 'Cập nhật thành công']);
  }

  public function detailProduct($id): JsonResponse
  {
    $product = Product::with([
      'category',
      'shop',
      'variants',
      'images',
      'primaryImage',
      'defaultVariant'
    ])->find($id);

    if (!$product) {
      return response()->json([
        'status' => false,
        'message' => 'Không tìm thấy sản phẩm'
      ], 404);
    }

    return response()->json([
      'status' => true,
      'message' => 'Chi tiết sản phẩm',
      'data' => $product
    ]);
  }

}