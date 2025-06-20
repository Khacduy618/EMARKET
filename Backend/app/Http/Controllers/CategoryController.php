<?php


namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
    // In ProductController.php

public function showProductsCategory(Request $request, Category $category)
{
    try {
        // ... (phần lấy categoryIds giữ nguyên)
        $categoryIds = $this->getAllChildCategoryIds($category);
        $categoryIds[] = $category->CategoryID;

        $query = Product::query()
            ->whereIn('CategoryID', $categoryIds);

        $sort = $request->input('sort', 'popular');

        // Lấy tên bảng từ model để dùng trong DB::raw, an toàn và linh hoạt
        $productTable = (new Product())->getTable();
        $variantTable = (new \App\Models\ProductVariant())->getTable();
        $orderItemTable = (new \App\Models\OrderItem())->getTable(); // <-- Lấy tên bảng từ Model

        switch ($sort) {
            case 'price_asc':
                $query->select("$productTable.*")
                      ->join($variantTable, "$productTable.ProductID", '=', "$variantTable.ProductID")
                      ->groupBy("$productTable.ProductID")
                      ->orderBy(DB::raw("MIN($variantTable.Price)"), 'asc');
                break;

            case 'price_desc':
                $query->select("$productTable.*")
                      ->join($variantTable, "$productTable.ProductID", '=', "$variantTable.ProductID")
                      ->groupBy("$productTable.ProductID")
                      ->orderBy(DB::raw("MAX($variantTable.Price)"), 'desc');
                break;

            case 'bestselling':
                $query->select("$productTable.*", DB::raw("SUM(IFNULL($orderItemTable.Quantity, 0)) as total_sold"))
                      ->leftJoin($variantTable, "$productTable.ProductID", '=', "$variantTable.ProductID")
                      ->leftJoin($orderItemTable, "$variantTable.VariantID", '=', "$orderItemTable.VariantID")
                      ->groupBy("$productTable.ProductID")
                      ->orderByDesc('total_sold');
                break;

            case 'newest':
                $query->orderBy("$productTable.CreatedAt", 'desc');
                break;

            case 'popular':
            default:
                // Định nghĩa "Phổ biến" là bán chạy nhất
                $query->select("$productTable.*", DB::raw("SUM(IFNULL($orderItemTable.Quantity, 0)) as total_sold"))
                      ->leftJoin($variantTable, "$productTable.ProductID", '=', "$variantTable.ProductID")
                      ->leftJoin($orderItemTable, "$variantTable.VariantID", '=', "$orderItemTable.VariantID")
                      ->groupBy("$productTable.ProductID")
                      ->orderByDesc('total_sold');
                break;
        }

        $perPage = $request->input('per_page', 20);
        $paginatedProducts = $query->paginate($perPage);

            // BƯỚC 5: BIẾN ĐỔI DỮ LIỆU
            // Tải lại quan hệ để đảm bảo dữ liệu đúng sau khi join và group
            $paginatedProducts->load('images', 'variants', 'category');

            $transformedProducts = $paginatedProducts->getCollection()->map(function ($product) {
                return [
                    'ProductID' => $product->ProductID,
                    'Name'      => $product->Name,
                    'images'    => $product->images->map(function ($image) {
                        return [
                            'ImageID'   => $image->ImageID,
                            'ImageURL'  => $image->ImageURL,
                            'IsPrimary' => $image->IsPrimary,
                        ];
                    }),
                    'variants'  => $product->variants->map(function ($variant) {
                        return [
                            'VariantID'      => $variant->VariantID,
                            'Price'          => $variant->Price,
                            'CompareAtPrice' => $variant->CompareAtPrice,
                        ];
                    }),
                    'category'  => $product->category ? [
                        'CategoryID'       => $product->category->CategoryID,
                        'Name'             => $product->category->Name,
                        'ParentCategoryID' => $product->category->ParentCategoryID,
                    ] : null,
                ];
            });

            // BƯỚC 6: TRẢ VỀ RESPONSE
            return response()->json([
                'data'         => $transformedProducts,
                'total'        => $paginatedProducts->total(),
                'current_page' => $paginatedProducts->currentPage(),
                'last_page'    => $paginatedProducts->lastPage(),
            ]);

        } catch (\Exception $e) {
            Log::error('Error in showProductsCategory: ' . $e->getMessage(), [
                'category_id' => $category->CategoryID,
                'request' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'An internal server error occurred.', 'error' => $e->getMessage()], 500);
        }
    }    
     private function getAllChildCategoryIds(Category $category): array
    {
        $childIds = [];
        // Sử dụng eager loading cho quan hệ đệ quy để tối ưu
        $children = $category->load('allChildren')->allChildren;

        foreach ($children as $child) {
            $childIds[] = $child->CategoryID;
            if ($child->allChildren->isNotEmpty()) {
                $childIds = array_merge($childIds, $this->getAllChildCategoryIds($child));
            }
        }
        return $childIds;
    }

}