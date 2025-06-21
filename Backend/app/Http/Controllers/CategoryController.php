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
        // === BƯỚC 1: LẤY DANH SÁCH ID DANH MỤC BAN ĐẦU ===
        // ID của danh mục cha và tất cả các con của nó
        $baseCategoryIds = $this->getAllChildCategoryIds($category);
        $baseCategoryIds[] = $category->CategoryID;

        $query = Product::query(); // Bắt đầu query

        // === BƯỚC 2: XỬ LÝ LỌC (FILTERS) ===

        // -- Lọc theo Danh mục được chọn (CHECKBOX) --
        $selectedCategories = $request->input('categories'); // Ví dụ: '5,6'
        
        if ($selectedCategories) {
            // Nếu người dùng đã chọn danh mục cụ thể từ bộ lọc,
            // thì chúng ta chỉ lọc theo những danh mục đó.
            $categoryIdsToFilter = explode(',', $selectedCategories);
            $query->whereIn('products.CategoryID', $categoryIdsToFilter);
        } else {
            // Nếu không, mặc định lọc theo danh mục cha và tất cả các con của nó.
            $query->whereIn('products.CategoryID', $baseCategoryIds);
        }


        // -- Lọc theo Khoảng Giá (Dùng whereHas như trước) --
        $minPrice = $request->input('min_price');
        $maxPrice = $request->input('max_price');

        if ($minPrice || $maxPrice) {
            $query->whereHas('variants', function ($variantQuery) use ($minPrice, $maxPrice) {
                if ($minPrice) $variantQuery->where('Price', '>=', $minPrice);
                if ($maxPrice) $variantQuery->where('Price', '<=', $maxPrice);
            });
        }
            // === BƯỚC 3: XỬ LÝ LỌC (FILTERS) ===

            // -- Lọc theo Khoảng Giá --
            $minPrice = $request->input('min_price');
            $maxPrice = $request->input('max_price');

            // Nếu có ít nhất một bộ lọc cần join với bảng variants, chúng ta sẽ join
            // `whereHas` là một cách an toàn và hiệu quả để lọc dựa trên quan hệ
            if ($minPrice || $maxPrice) {
                $query->whereHas('variants', function ($variantQuery) use ($minPrice, $maxPrice) {
                    if ($minPrice) {
                        $variantQuery->where('Price', '>=', $minPrice);
                    }
                    if ($maxPrice) {
                        $variantQuery->where('Price', '<=', $maxPrice);
                    }
                });
            }

            // (Bạn có thể thêm các bộ lọc khác ở đây, ví dụ: theo thương hiệu, theo đánh giá,...)

            // === BƯỚC 4: XỬ LÝ SẮP XẾP (SORTING) ===
            $sort = $request->input('sort', 'popular');
            $variantTable = (new \App\Models\ProductVariant())->getTable();
            $orderItemTable = (new \App\Models\OrderItem())->getTable();

            switch ($sort) {
                case 'price_asc':
                    // Sắp xếp theo giá thấp nhất của sản phẩm
                    // Dùng subquery để lấy giá min, tránh ảnh hưởng đến các điều kiện khác
                    $query->orderBy(
                        \App\Models\ProductVariant::select('Price')
                            ->whereColumn('ProductID', 'products.ProductID')
                            ->orderBy('Price', 'asc')
                            ->limit(1)
                    , 'asc');
                    break;

                case 'price_desc':
                    // Sắp xếp theo giá cao nhất của sản phẩm
                    $query->orderBy(
                        \App\Models\ProductVariant::select('Price')
                            ->whereColumn('ProductID', 'products.ProductID')
                            ->orderBy('Price', 'desc')
                            ->limit(1)
                    , 'desc');
                    break;

                case 'bestselling':
                    // Sắp xếp theo tổng số lượng bán được
                    $query->addSelect([
                        'total_sold' => \App\Models\OrderItem::selectRaw('SUM(Quantity)')
                            ->join($variantTable, 'order_items.VariantID', '=', "$variantTable.VariantID")
                            ->whereColumn("$variantTable.ProductID", 'products.ProductID')
                    ])->orderByDesc('total_sold');
                    break;

                case 'newest':
                    $query->orderBy('products.CreatedAt', 'desc');
                    break;

                case 'popular':
                default:
                    // Mặc định "Phổ biến" là sản phẩm mới nhất hoặc bán chạy, ở đây chọn mới nhất
                    $query->orderBy('products.CreatedAt', 'desc');
                    break;
            }

            // === BƯỚC 5: PHÂN TRANG VÀ TẢI QUAN HỆ ===
            $perPage = $request->input('per_page', 20);
            // Eager load các quan hệ cần thiết SAU KHI đã lọc và sắp xếp
            $paginatedProducts = $query->with(['images', 'variants', 'category'])->paginate($perPage);

            // === BƯỚC 6: BIẾN ĐỔI DỮ LIỆU ĐỂ TRẢ VỀ (GIỮ NGUYÊN) ===
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

            // === BƯỚC 7: TRẢ VỀ RESPONSE JSON ===
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
    public function getCategoryFilters(Category $category = null)
    {
        try {
            // Xác định các danh mục mục tiêu
            if ($category) {
                // Lấy các con trực tiếp của danh mục cha
                $targetCategories = $category->children()->with('allChildren')->get();
            } else {
                // Lấy các danh mục gốc (cấp 1)
                $targetCategories = Category::whereNull('ParentCategoryID')
                                            ->with('allChildren')
                                            ->get();
            }

            if ($targetCategories->isEmpty()) {
                return response()->json([]);
            }

            // Đếm sản phẩm cho TẤT CẢ các danh mục trong 1 query
            $productCounts = DB::table('Products')
                               ->select('CategoryID', DB::raw('count(*) as total'))
                               ->groupBy('CategoryID')
                               ->pluck('total', 'CategoryID');

            $categoryFilters = $targetCategories->map(function ($cat) use ($productCounts) {
                // Lấy ID từ cây danh mục, BAO GỒM cả ID của chính nó
                $allCategoryIds = $this->getIdsFromCategoryTree($cat);

                // Tính tổng sản phẩm
                $totalProducts = 0;
                foreach ($allCategoryIds as $id) {
                    if (isset($productCounts[$id])) {
                        $totalProducts += $productCounts[$id];
                    }
                }

                if ($totalProducts > 0) {
                    return [
                        'CategoryID' => $cat->CategoryID,
                        'Name' => $cat->Name,
                        'products_count' => $totalProducts,
                    ];
                }
                return null;
            })->filter()->values();

            // Sắp xếp theo số sản phẩm giảm dần
            $sortedFilters = $categoryFilters->sortByDesc('products_count')->values();

            return response()->json($sortedFilters);

        } catch (\Exception $e) {
            Log::error('Error in getCategoryFilters: ' . $e->getMessage(), [
                'category_id' => $category ? $category->CategoryID : null,
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'An internal server error occurred.'], 500);
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
    private function getIdsFromCategoryTree(Category $category): array
    {
        // Bắt đầu với ID của chính nó
        $ids = [$category->CategoryID];

        // Lặp qua các con đã được load sẵn
        foreach ($category->allChildren as $child) {
            // Nối mảng ID của con vào mảng hiện tại một cách đệ quy
            // Vì allChildren cũng đã được load đệ quy, việc này rất nhanh
            $ids = array_merge($ids, $this->getIdsFromCategoryTree($child));
        }
        return $ids;
    }

}