<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductControllers extends Controller
{
  public function index(Request $request): JsonResponse
  {
    $query = Product::with('category'); // <-- Thêm eager load category

    // Tìm kiếm theo từ khóa
    if ($request->filled('keyword')) {
      $query->where('Name', 'like', '%' . $request->keyword . '%');
    }

    // Lọc theo trạng thái duyệt
    if ($request->filled('approval_status')) {
      $query->where('AdminApprovalStatus', $request->approval_status);
    }

    // Lọc theo trạng thái hoạt động
    if ($request->has('is_active')) {
      $query->where('IsActive', (bool) $request->is_active);
    }

    $sortBy = $request->get('sort_by', 'CreatedAt');
    $sortOrder = $request->get('sort_order', 'desc');

    $allowedSorts = ['CreatedAt', 'Name', 'SoldCount', 'ViewCount', 'Price'];

    if (!in_array($sortBy, $allowedSorts)) {
      $sortBy = 'CreatedAt';
    }
    if (!in_array(strtolower($sortOrder), ['asc', 'desc'])) {
      $sortOrder = 'desc';
    }

    $query->orderBy($sortBy, $sortOrder);

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