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
    return response()->json($tree);
  }

  public function index() {
    $allCategories = PlatformCategory::where('Deleted', 0)->get();
    // return $allCategories;
    return view('admin.pages.categories.index', ['categories' => $allCategories]);
  }

  public function createPost(Request $req) {
    try {
      $category = new PlatformCategory();
      $category->Name = $req->Name;
      $category->ParentCategoryID = $req->Parent;
      $category->ImageURL = $req->image_name;
      $category->IsActive = true;

      if ($category->save()) {
        return redirect()->back()->with([
          'type' => 'success',
          'message' => 'Thêm danh mục thành công'
        ]);
      } else {
        return redirect()->back()->with([
          'type' => 'danger',
          'message' => 'Không thể lưu danh mục, vui lòng thử lại'
        ]);
      }

    } catch (\Exception $e) {
      return redirect()->back()->with([
        'type' => 'danger',
        'message' => 'Đã xảy ra lỗi: ' . $e->getMessage()
      ])->withInput(); 
    }
  }

  public function deleteCategory(Request $req){
    try {
      PlatformCategory::where('CategoryID', $req->id)->update(['Deleted' => true]);
      return redirect()->back()->with(['type' => 'success', 'message' => 'Xóa danh mục thành công']);
    } catch (\Exception $e) {
        return  $e->getMessage();
    }
  }

  public function editGet(Request $req){
    $category = PlatformCategory::where(['Deleted', 0])->where('CategoryID', $req->id)->first(); 
    return response()->json($category);
  }

  public function updateCategory(Request $req)
{
    try {
        // Tìm danh mục cần cập nhật
        $category = PlatformCategory::find($req->CategoryID);

        // Nếu không tìm thấy, trả về lỗi
        if (!$category) {
            return redirect()->back()->with([
                'type' => 'danger',
                'message' => 'Không tìm thấy danh mục cần cập nhật'
            ]);
        }

        // Cập nhật thông tin từ request
        $category->Name = $req->Name;
        $category->ParentCategoryID = $req->Parent;
        $category->ImageURL = $req->image_name ?? $category->ImageURL; 
        $category->IsActive = true;

        // Lưu lại
        if ($category->save()) {
            return redirect()->back()->with([
                'type' => 'success',
                'message' => 'Cập nhật danh mục thành công'
            ]);
        } else {
            return redirect()->back()->with([
                'type' => 'danger',
                'message' => 'Không thể cập nhật danh mục, vui lòng thử lại'
            ]);
        }
    } catch (\Exception $e) {
        return redirect()->back()->with([
            'type' => 'danger',
            'message' => 'Đã xảy ra lỗi: ' . $e->getMessage()
        ])->withInput();
    }
}

}