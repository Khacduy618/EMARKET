<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlatformCategory;
use Illuminate\Http\Request;
use App\utils\CategoryUtil;

class CategoryController extends Controller {
 
  public function getAllCategory() {
    $allCategories = PlatformCategory::where('Deleted', 0)->get()->toArray();
    $tree = CategoryUtil::createTree($allCategories, null);
    return response()->json(['status' => 'success', 'data' => $tree]);
  }

  public function index(Request $req) {

    $find = [
      ['Deleted', '=', '0'],
    ];

    // Search
    if($req->keyword){
      $find[] = ['Name', 'like', '%' . $req->keyword . '%'];
    }
    //End search

    //pagination 
    $quantityDisplay = 5;

    if($req->display_quantity){
      $quantityDisplay = $req->display_quantity;
    }

    $pagination = [
      'currentPage' => 1,
      'limitItem' => $quantityDisplay,
      'skipRecords' => 0,
      'totalPage' => 0
    ];

    $totalRecords = PlatformCategory::where($find)->count();
    CategoryUtil::pagination($req, $pagination, $totalRecords);
    //End pagination


    $allCategories = PlatformCategory::where($find)
      ->skip($pagination['skipRecords'])
      ->take($pagination['limitItem'])
      ->get();

    return response()->json([
      'status' => 'success',   
      'data' => $allCategories,
      'pagination' => $pagination,
      'keyword' => $req->keyword,
    ]);
  }

  public function createPost(Request $req) {
    try {
      $category = new PlatformCategory();
      $category->Name = $req->Name;
      $category->ParentCategoryID = $req->Parent;
      $category->ImageURL = $req->image_name;
      $category->IsActive = true;

      if ($category->save()) {
        return response()->json(['status' => 'success', 'message' => 'Thêm danh mục thành công']);
      } else {
        return response()->json(['status' => 'error', 'message' => 'Không thể lưu danh mục, vui lòng thử lại'], 500);
      }

    } catch (\Exception $e) {
      return response()->json(['status' => 'error', 'message' => 'Đã xảy ra lỗi: ' . $e->getMessage()], 500);
    }
  }

  public function deleteCategory(Request $req){
    try {
      PlatformCategory::where('CategoryID', $req->id)->update(['Deleted' => true]);
      return response()->json(['status' => 'success', 'message' => 'Xóa danh mục thành công']);
    } catch (\Exception $e) {
      return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
  }

  public function editGet(Request $req){
    $category = PlatformCategory::where('Deleted', 0)->where('CategoryID', $req->id)->first(); 
    if ($category) {
      return response()->json(['status' => 'success', 'data' => $category]);
    } else {
      return response()->json(['status' => 'error', 'message' => 'Không tìm thấy danh mục'], 404);
    }
  }

  // Cập nhật danh mục
  public function updateCategory(Request $req) {
    try {
      $category = PlatformCategory::find($req->CategoryID);

      if (!$category) {
        return response()->json(['status' => 'error', 'message' => 'Không tìm thấy danh mục cần cập nhật'], 404);
      }

      $category->Name = $req->Name;
      $category->ParentCategoryID = $req->Parent;
      $category->ImageURL = $req->image_name ?? $category->ImageURL;
      $category->IsActive = true;

      if ($category->save()) {
        return response()->json(['status' => 'success', 'message' => 'Cập nhật danh mục thành công']);
      } else {
        return response()->json(['status' => 'error', 'message' => 'Không thể cập nhật danh mục, vui lòng thử lại'], 500);
      }

    } catch (\Exception $e) {
      return response()->json(['status' => 'error', 'message' => 'Đã xảy ra lỗi: ' . $e->getMessage()], 500);
    }
  }
}
