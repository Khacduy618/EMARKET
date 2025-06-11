<?php


namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;

class CategoryController extends Controller
{
    public function index()
    {
        // 1. Xác định "mùa" hiện tại (không đổi)
        $currentMonth = Date::now()->month;
        $currentSeason = 0;
        if (in_array($currentMonth, [1, 2, 3])) $currentSeason = 1;
        elseif (in_array($currentMonth, [4, 5, 6])) $currentSeason = 2;
        elseif (in_array($currentMonth, [7, 8, 9])) $currentSeason = 3;
        else $currentSeason = 4;

        // 2. Xây dựng câu query MỚI và LINH HOẠT
        $categories = Category::with([
            // Luôn lọc các children để chỉ lấy những con hợp mùa
            'children' => function ($query) use ($currentSeason) {
                $query->where('IsActive', $currentSeason)
                      ->orWhere('IsActive', 0);
            }
        ])
        // Bắt đầu từ các danh mục cha
        ->whereNull('ParentCategoryID')
        // Áp dụng điều kiện lọc linh hoạt cho danh mục cha
        ->where(function ($query) use ($currentSeason) {
            // Điều kiện 1: Bản thân danh mục cha phù hợp với mùa
            $query->where('IsActive', $currentSeason)
                  ->orWhere('IsActive', 0)
                  // Điều kiện 2: HOẶC danh mục cha này CÓ CHỨA (has)
                  // ít nhất một danh mục con phù hợp với mùa
                  ->orWhereHas('children', function ($subQuery) use ($currentSeason) {
                      $subQuery->where('IsActive', $currentSeason)
                               ->orWhere('IsActive', 0);
                  });
        })
        ->orderBy('CategoryID', 'asc')
        ->get();

        return response()->json($categories);
    }
    public function store(Request $request)
{
    // Validate dữ liệu đầu vào
    $request->validate([
        'Name' => 'required|string|max:255',
        'Description' => 'nullable|string',
        'ParentCategoryID' => 'nullable|integer',
        'Slug' => 'required|string|max:255|unique:platformcategories,Slug',
        'ImageURL' => 'nullable|url',
        'IsActive' => 'required|boolean'
    ]);

    // Tạo mới category
    $category = new Category();
    $category->Name = $request->Name;
    $category->Description = $request->Description;
    $category->ParentCategoryID = $request->ParentCategoryID;
    $category->Slug = $request->Slug;
    $category->ImageURL = $request->ImageURL;
    $category->IsActive = $request->IsActive;

    $category->save();

    return response()->json([
        'status' => 'success',
        'message' => 'Thêm danh mục thành công!',
        'data' => $category
    ]);
}
public function update(Request $request, $id)
{
    try {
        $category = Category::findOrFail($id);

        $request->validate([
            'Name' => 'required|string|max:255',
            'Description' => 'nullable|string',
            'ParentCategoryID' => 'nullable|integer',
            'Slug' => 'required|string|max:255|unique:platformcategories,Slug,' . $id . ',CategoryID',
            'ImageURL' => 'nullable|url',
            'IsActive' => 'required|boolean'
        ]);

        $category->Name = $request->Name;
        $category->Description = $request->Description;
        $category->ParentCategoryID = $request->ParentCategoryID;
        $category->Slug = $request->Slug;
        $category->ImageURL = $request->ImageURL;
        $category->IsActive = $request->IsActive;

        $category->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Cập nhật danh mục thành công!',
            'data' => $category
        ], 200);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Không tìm thấy danh mục với id: ' . $id,
        ], 404);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Dữ liệu không hợp lệ',
            'errors' => $e->errors(),
        ], 422);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Lỗi server: ' . $e->getMessage(),
        ], 500);
    }
}
    public function destroy($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'message' => 'Không tìm thấy danh mục với id: ' . $id,
            ], 404);
        }

        $category->delete();

        return response()->json([
            'message' => 'Xóa danh mục thành công!',
        ]);
    }

    public function category_cha_con()
    {
        $categories = Category::with('children')->whereNull('ParentCategoryID')->get();

        return response()->json($categories);
    }

}