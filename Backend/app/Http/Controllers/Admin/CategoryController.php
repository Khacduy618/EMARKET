<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlatformCategory;
use App\Models\CategoryAttribute;
use App\Models\Attribute;
use Illuminate\Http\Request;
use App\utils\CategoryUtil;
use App\utils\UploadImage;
use Illuminate\Support\Facades\DB;


class CategoryController extends Controller
{

  public function getAllCategory()
  {
    $allCategories = PlatformCategory::where('Deleted', 0)->get()->toArray();
    $tree = CategoryUtil::createTree($allCategories, null);
    return response()->json(['status' => 'success', 'data' => $tree]);
  }

  public function index(Request $req)
  {

    $find = [
      ['Deleted', '=', '0'],
    ];

    // Search
    if ($req->keyword) {
      $find[] = ['Name', 'like', '%' . $req->keyword . '%'];
    }
    //End search

    //pagination 
    $quantityDisplay = 5;

    if ($req->display_quantity) {
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

  public function createPost(Request $req)
  {
    $validated = $req->validate([
      'Name' => 'required|string|max:255',
    ], [
      'Name.required' => 'Tên danh mục không được để trống',
      'Name.string' => 'Tên danh mục phải là chuỗi',
      'Name.max' => 'Tên danh mục không được vượt quá 255 ký tự',
    ]);
    $imageUrl = UploadImage::uploadImage($req, 'image');

    try {
      DB::beginTransaction();
      // Add category
      $category = new PlatformCategory();
      $category->Name = $req->Name;
      $category->ParentCategoryID = $req->Parent == 0 ? null : $req->Parent;
      $category->ImageURL = $imageUrl;
      $category->IsActive = true;
      $category->save();

      // Add attribute category
      $existingAttributes = Attribute::whereIn('Name', $req->Attributes)->get();
      $existingIds = $existingAttributes->pluck('AttributeID')->toArray();

      // filter id not existed
      $existingNames = $existingAttributes->pluck('Name')->toArray();
      $newNames = array_diff($req->Attributes, $existingNames);

      $newIds = [];
      foreach ($newNames as $name) {
        $newIds[] = Attribute::create(['Name' => $name])->AttributeID;
      }

      $allIds = array_merge($existingIds, $newIds);

      foreach ($allIds as $attrId) {
        CategoryAttribute::create([
          'CategoryID' => $category->CategoryID,
          'AttributeID' => $attrId,
        ]);
      }
      DB::commit();

      return response()->json(['status' => 'success', 'message' => 'Thêm danh mục thành công']);

    } catch (\Exception $e) {
      DB::rollBack();
      return response()->json(['status' => 'error', 'message' => 'Đã xảy ra lỗi: ' . $e->getMessage()], 500);
    }
  }


  public function deleteCategory(Request $req)
  {
    try {
      PlatformCategory::where('CategoryID', $req->id)->update(['Deleted' => true]);
      return response()->json(['status' => 'success', 'message' => 'Xóa danh mục thành công']);
    } catch (\Exception $e) {
      return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
  }

  public function editGet(Request $req)
  {
    $category = PlatformCategory::with([
      'attributes' => function ($q) {
        $q->select('Attributes.AttributeID', 'Attributes.Name');
      }
    ])
      ->where('Deleted', 0)
      ->where('CategoryID', $req->id)
      ->first();

    if ($category) {
      return response()->json([
        'status' => 'success',
        'data' => [
          'CategoryID' => $category->CategoryID,
          'Name' => $category->Name,
          'ParentCategoryID' => $category->ParentCategoryID,
          'ImageURL' => $category->ImageURL,
          'Attributes' => $category->attributes
        ]
      ]);
    } else {
      return response()->json(['status' => 'error', 'message' => 'Không tìm thấy danh mục'], 404);
    }
  }
  public function updateCategory(Request $req)
  {
    $validated = $req->validate([
      'CategoryID' => 'required|integer',
      'Name' => 'required|string|max:255',
    ], [
      'CategoryID.required' => 'Danh mục cần có ID',
      'Name.required' => 'Tên danh mục không được để trống',
      'Name.string' => 'Tên danh mục phải là chuỗi',
      'Name.max' => 'Tên danh mục không được vượt quá 255 ký tự',
    ]);

    try {
      DB::beginTransaction();

      $category = PlatformCategory::find($req->CategoryID);

      if (!$category) {
        return response()->json(['status' => 'error', 'message' => 'Không tìm thấy danh mục cần cập nhật'], 404);
      }

      // Update category info
      $imageUrl = UploadImage::uploadImage($req, 'image');
      $category->Name = $req->Name;
      $category->ParentCategoryID = $req->Parent == 0 ? null : $req->Parent;
      $category->ImageURL = $imageUrl ?? $category->ImageURL;
      $category->IsActive = true;
      $category->save();

      // Xử lý attributes nếu có gửi kèm
      if ($req->has('Attributes')) {
        $attributes = $req->Attributes;

        // lấy thuộc tính đã tồn tại
        $existingAttributes = Attribute::whereIn('Name', $attributes)->get();
        $existingIds = $existingAttributes->pluck('AttributeID')->toArray();

        // lấy thuộc tính chưa tồn tại
        $existingNames = $existingAttributes->pluck('Name')->toArray();
        $newNames = array_diff($attributes, $existingNames);

        $newIds = [];
        foreach ($newNames as $name) {
          $newIds[] = Attribute::create(['Name' => $name])->AttributeID;
        }

        $allIds = array_merge($existingIds, $newIds);

        // clear mối quan hệ cũ
        CategoryAttribute::where('CategoryID', $category->CategoryID)->delete();

        // insert lại mối quan hệ
        foreach ($allIds as $attrId) {
          CategoryAttribute::create([
            'CategoryID' => $category->CategoryID,
            'AttributeID' => $attrId,
          ]);
        }
      }

      DB::commit();

      return response()->json(['status' => 'success', 'message' => 'Cập nhật danh mục thành công']);

    } catch (\Exception $e) {
      DB::rollBack();
      return response()->json(['status' => 'error', 'message' => 'Đã xảy ra lỗi: ' . $e->getMessage()], 500);
    }
  }



}
