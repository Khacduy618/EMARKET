<?php


namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use App\Models\Product;

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

    public function showProductsCategory(Request $request, Category $category)
    {
        // === BƯỚC 1: LẤY ID CỦA DANH MỤC HIỆN TẠI VÀ TẤT CẢ CÁC DANH MỤC CON ===
        $categoryIds = $this->getAllChildCategoryIds($category);
        $categoryIds[] = $category->CategoryID;

        // === BƯỚC 2: XÂY DỰNG QUERY CƠ BẢN ===
        $query = Product::query()
            ->whereIn('CategoryID', $categoryIds)
            // Eager Loading các quan hệ để tối ưu hiệu năng, tránh N+1 query
            ->with(['images', 'variants', 'category']);

        // === BƯỚC 3: XỬ LÝ SẮP XẾP (SORTING) DỰA TRÊN HÌNH ẢNH MỚI ===
        // Lấy giá trị sort từ request, mặc định là 'popular' (Phổ biến)
        $sort = $request->input('sort', 'popular');

        switch ($sort) {
            case 'price_asc':
                // Sắp xếp theo giá tăng dần
                // Lưu ý: Cần join và group by để lấy giá từ bảng variants
                $query->select('products.*')
                      ->join('variants', 'products.ProductID', '=', 'variants.ProductID')
                      ->groupBy('products.ProductID')
                      ->orderBy('variants.Price', 'asc');
                break;

            case 'price_desc':
                // Sắp xếp theo giá giảm dần
                $query->select('products.*')
                      ->join('variants', 'products.ProductID', '=', 'variants.ProductID')
                      ->groupBy('products.ProductID')
                      ->orderBy('variants.Price', 'desc');
                break;

            case 'bestselling':
                // Sắp xếp theo "Bán Chạy"
                // YÊU CẦU: Cần có bảng `order_items` chứa `ProductID` và `Quantity` để tính tổng đã bán.
                // Nếu cấu trúc DB của bạn khác, hãy sửa lại đoạn này.
                $query->leftJoin('order_items', 'products.ProductID', '=', 'order_items.ProductID')
                      ->selectRaw('products.*, SUM(order_items.Quantity) as total_sold')
                      ->groupBy('products.ProductID') // Quan trọng khi dùng hàm tổng hợp SUM
                      ->orderByDesc('total_sold');
                break;

            case 'newest':
                // Sắp xếp theo "Mới Nhất", dựa vào ProductID giảm dần (giả định ID cao hơn là mới hơn)
                $query->orderBy('products.ProductID', 'desc');
                break;

            case 'popular':
            default:
                // Sắp xếp theo "Phổ Biến" hoặc mặc định.
                // Bạn có thể định nghĩa 'popular' theo nhiều cách (lượt xem, bán chạy,...).
                // Ở đây, chúng ta tạm lấy sản phẩm mới nhất làm mặc định cho "Phổ biến".
                $query->orderBy('products.ProductID', 'desc');
                break;
        }

        // === BƯỚC 4: PHÂN TRANG (PAGINATION) ===
        $perPage = $request->input('per_page', 20);
        $paginatedProducts = $query->paginate($perPage);

        // === BƯỚC 5: BIẾN ĐỔI DỮ LIỆU ĐỂ KHỚP VỚI FRONTEND ===
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
                'category'  => [
                    'CategoryID'       => $product->category->CategoryID,
                    'Name'             => $product->category->Name,
                    'ParentCategoryID' => $product->category->ParentCategoryID,
                ]
            ];
        });

        // === BƯỚC 6: TRẢ VỀ RESPONSE JSON VỚI CẤU TRÚC ĐÚNG ===
        // Cấu trúc này khớp với interface `PaginatedResponse<T>` bên phía Next.js
        return response()->json([
            'data'         => $transformedProducts,
            'total'        => $paginatedProducts->total(),
            'current_page' => $paginatedProducts->currentPage(),
            'last_page'    => $paginatedProducts->lastPage(),
        ]);
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