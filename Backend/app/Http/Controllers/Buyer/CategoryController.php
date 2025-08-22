<?php


namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;

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
        // 1. Xác định "mùa" hiện tại (Giữ nguyên)
        $currentMonth = now()->month;
        $currentSeason = 'Winter'; // Mặc định
    
        if (in_array($currentMonth, [3, 4, 5])) {
            $currentSeason = 'Spring';
        } elseif (in_array($currentMonth, [6, 7, 8])) {
            $currentSeason = 'Summer';
        } elseif (in_array($currentMonth, [9, 10, 11])) {
            $currentSeason = 'Autumn';
        }
    
        // 2. Truy vấn TRỰC TIẾP vào danh mục CON
        $childCategories = Category::query()
            // --- ĐIỀU KIỆN QUAN TRỌNG NHẤT ---
            // Chỉ lấy những danh mục có ParentCategoryID (tức là danh mục con)
            ->whereNotNull('ParentCategoryID') 
            
            // Áp dụng các bộ lọc khác
            ->where('IsActive', 1)
            ->where('Deleted', 0)
            
            // Lọc theo mùa hiện tại (hoặc không có mùa)
            ->where(function ($query) use ($currentSeason) {
                $query->where('Season', $currentSeason)
                      ->orWhereNull('Season');
            })
            
            ->orderBy('CategoryID', 'asc')
            ->get();
    
        // 3. Trả về danh sách phẳng của các danh mục con
        return response()->json($childCategories);
    }
    public function store(Request $request)
{
    // Validate dữ liệu đầu vào
    $request->validate([
        'Name' => 'required|string|max:255',
        'Description' => 'nullable|string',
        'ParentCategoryID' => 'nullable|integer',
        'Slug' => 'required|string|max:255|unique:PlatformCategories,Slug',
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
            'Slug' => 'required|string|max:255|unique:PlatformCategories,Slug,' . $id . ',CategoryID',
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
 
    public function getCategoryFilters(?Category $category = null)
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

   

    //  private function getAllChildCategoryIds(Category $category): array
    // {
    //     $childIds = [];
    //     // Sử dụng eager loading cho quan hệ đệ quy để tối ưu
    //     $children = $category->load('allChildren')->allChildren;

    //     foreach ($children as $child) {
    //         $childIds[] = $child->CategoryID;
    //         if ($child->allChildren->isNotEmpty()) {
    //             $childIds = array_merge($childIds, $this->getAllChildCategoryIds($child));
    //         }
    //     }
    //     return $childIds;
    // }

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

    // public function showProductsCategory(Request $request, Category $category)
    // {
    //     // === BƯỚC 1: LẤY ID CỦA DANH MỤC HIỆN TẠI VÀ TẤT CẢ CÁC DANH MỤC CON ===
    //     $categoryIds = $this->getAllChildCategoryIds($category);
    //     $categoryIds[] = $category->CategoryID;

    //     // === BƯỚC 2: XÂY DỰNG QUERY CƠ BẢN ===
    //     $query = Product::query()
    //         ->whereIn('CategoryID', $categoryIds)
    //         // Eager Loading các quan hệ để tối ưu hiệu năng, tránh N+1 query
    //         ->with(['images', 'variants', 'category']);

    //     // === BƯỚC 3: XỬ LÝ SẮP XẾP (SORTING) DỰA TRÊN HÌNH ẢNH MỚI ===
    //     // Lấy giá trị sort từ request, mặc định là 'popular' (Phổ biến)
    //     $sort = $request->input('sort', 'popular');

    //     switch ($sort) {
    //         case 'price_asc':
    //             // Sắp xếp theo giá tăng dần
    //             // Lưu ý: Cần join và group by để lấy giá từ bảng variants
    //             $query->select('Products.*')
    //                   ->join('Variants', 'Products.ProductID', '=', 'Variants.ProductID')
    //                   ->groupBy('Products.ProductID')
    //                   ->orderBy('Variants.Price', 'asc');
    //             break;

    //         case 'price_desc':
    //             // Sắp xếp theo giá giảm dần
    //             $query->select('Products.*')
    //                   ->join('Variants', 'Products.ProductID', '=', 'Variants.ProductID')
    //                   ->groupBy('Products.ProductID')
    //                   ->orderBy('Variants.Price', 'desc');
    //             break;

    //         case 'bestselling':
    //             // Sắp xếp theo "Bán Chạy"
    //             // YÊU CẦU: Cần có bảng `order_items` chứa `ProductID` và `Quantity` để tính tổng đã bán.
    //             // Nếu cấu trúc DB của bạn khác, hãy sửa lại đoạn này.

    //             $query->leftJoin('order_items', 'Products.ProductID', '=', 'order_items.ProductID')
    //                   ->selectRaw('Products.*, SUM(order_items.Quantity) as total_sold')

    //             $query->leftJoin('OrderItems', 'Products.ProductID', '=', 'OrderItems.ProductID')
    //                   ->selectRaw('Products.*, SUM(OrderItems.Quantity) as total_sold')
    //                   ->groupBy('Products.ProductID') // Quan trọng khi dùng hàm tổng hợp SUM
    //                   ->orderByDesc('total_sold');
    //             break;

    //         case 'newest':
    //             // Sắp xếp theo "Mới Nhất", dựa vào ProductID giảm dần (giả định ID cao hơn là mới hơn)
    //             $query->orderBy('Products.ProductID', 'desc');
    //             break;

    //         case 'popular':
    //         default:
    //             // Sắp xếp theo "Phổ Biến" hoặc mặc định.
    //             // Bạn có thể định nghĩa 'popular' theo nhiều cách (lượt xem, bán chạy,...).
    //             // Ở đây, chúng ta tạm lấy sản phẩm mới nhất làm mặc định cho "Phổ biến".
    //             $query->orderBy('Products.ProductID', 'desc');
    //             break;
    //     }

    //     // === BƯỚC 4: PHÂN TRANG (PAGINATION) ===
    //     $perPage = $request->input('per_page', 20);
    //     $paginatedProducts = $query->paginate($perPage);

    //     // === BƯỚC 5: BIẾN ĐỔI DỮ LIỆU ĐỂ KHỚP VỚI FRONTEND ===
    //     $transformedProducts = $paginatedProducts->getCollection()->map(function ($product) {
    //         return [
    //             'ProductID' => $product->ProductID,
    //             'Name'      => $product->Name,
    //             'images'    => $product->images->map(function ($image) {
    //                 return [
    //                     'ImageID'   => $image->ImageID,
    //                     'ImageURL'  => $image->ImageURL,
    //                     'IsPrimary' => $image->IsPrimary,
    //                 ];
    //             }),
    //             'variants'  => $product->variants->map(function ($variant) {
    //                 return [
    //                     'VariantID'      => $variant->VariantID,
    //                     'Price'          => $variant->Price,
    //                     'CompareAtPrice' => $variant->CompareAtPrice,
    //                 ];
    //             }),
    //             'category'  => [
    //                 'CategoryID'       => $product->category->CategoryID,
    //                 'Name'             => $product->category->Name,
    //                 'ParentCategoryID' => $product->category->ParentCategoryID,
    //             ]
    //         ];
    //     });

    //     // === BƯỚC 6: TRẢ VỀ RESPONSE JSON VỚI CẤU TRÚC ĐÚNG ===
    //     // Cấu trúc này khớp với interface `PaginatedResponse<T>` bên phía Next.js
    //     return response()->json([
    //         'data'         => $transformedProducts,
    //         'total'        => $paginatedProducts->total(),
    //         'current_page' => $paginatedProducts->currentPage(),
    //         'last_page'    => $paginatedProducts->lastPage(),
    //     ]);
    // }
    // public function showProductsCategory(Request $request, Category $category)
    // {
    //     // === BƯỚC 1: XÂY DỰNG QUERY CƠ BẢN ===
    //     // Bắt đầu với query builder trống, chỉ eager load các quan hệ cần thiết.
    //     $query = Product::query()->with(['images', 'variants', 'category']);
    
    //     // === BƯỚC 2: ÁP DỤNG TẤT CẢ CÁC BỘ LỌC (WHERE CLAUSES) ===
    //     // Đây là phần cốt lõi để đảm bảo các bộ lọc được áp dụng một cách nhất quán.
    
    //     // 2.1. Lọc theo danh mục (LOGIC MỚI - QUAN TRỌNG)
    //     // Ưu tiên tham số 'categories' từ URL request.
    //     if ($request->has('categories')) {
    //         $selectedCategoryIds = explode(',', $request->input('categories'));
    //         // Lọc để đảm bảo tất cả các phần tử là số, tăng cường bảo mật.
    //         $selectedCategoryIds = array_filter($selectedCategoryIds, 'is_numeric');
    
    //         if (!empty($selectedCategoryIds)) {
    //             // Thêm tiền tố `Products.` để tránh lỗi "ambiguous column" khi JOIN sau này.
    //             $query->whereIn('Products.CategoryID', $selectedCategoryIds);
    //         }
    //     } else {
    //         // Nếu không có tham số 'categories', mới dùng danh mục gốc từ URL.
    //         $categoryIds = $this->getAllChildCategoryIds($category);
    //         $categoryIds[] = $category->CategoryID;
    //         $query->whereIn('Products.CategoryID', $categoryIds);
    //     }
    
    //     // 2.2. Lọc theo khoảng giá
    //     if ($request->has('min_price') || $request->has('max_price')) {
    //         $query->whereHas('variants', function ($variantQuery) use ($request) {
    //             if ($request->has('min_price') && is_numeric($request->input('min_price'))) {
    //                 $variantQuery->where('Price', '>=', (float)$request->input('min_price'));
    //             }
    //             if ($request->has('max_price') && is_numeric($request->input('max_price'))) {
    //                 $variantQuery->where('Price', '<=', (float)$request->input('max_price'));
    //             }
    //         });
    //     }
    
    //     // 2.3. Lọc theo từ khóa tìm kiếm
    //     if ($request->has('q') && !empty($request->input('q'))) {
    //         $searchTerm = $request->input('q');
    //         $query->where(function ($subQuery) use ($searchTerm) {
    //             $subQuery->where('Products.Name', 'LIKE', '%' . $searchTerm . '%')
    //                      ->orWhere('Products.Description', 'LIKE', '%' . $searchTerm . '%');
    //         });
    //     }
    
    //     // === BƯỚC 3: XỬ LÝ SẮP XẾP (ORDER BY & JOIN CLAUSES) ===
    //     // Bây giờ, chúng ta mới thay đổi cấu trúc query để sắp xếp.
    //     $sort = $request->input('sort', 'popular');
    
    //     switch ($sort) {
    //         case 'price_asc':
    //             // Sắp xếp theo giá tăng dần
    //             // Lưu ý: Cần join và group by để lấy giá từ bảng variants
    //             $query->select('Products.*')
    //                   ->join('ProductVariants', 'Products.ProductID', '=', 'ProductVariants.ProductID')
    //                   ->groupBy('Products.ProductID')
    //                   ->orderBy('ProductVariants.Price', 'asc');
    //             break;

    //         case 'price_desc':
    //             // Sắp xếp theo giá giảm dần
    //             $query->select('Products.*')
    //                   ->join('ProductVariants', 'Products.ProductID', '=', 'ProductVariants.ProductID')
    //                   ->groupBy('Products.ProductID')
    //                   ->orderBy('ProductVariants.Price', 'desc');
    //             break;
    
    //             case 'bestselling':
    //                 // === LOGIC TÍNH "BÁN CHẠY" ĐÃ SỬA ĐÚNG THEO CẤU TRÚC DB ===
    //                 $query
    //                     // Chọn tất cả các cột từ bảng Products
    //                     ->select('Products.*')
                        
    //                     // Thêm một cột ảo 'total_sold' bằng cách tính tổng Quantity
    //                     ->selectRaw('SUM(OrderItems.Quantity) as total_sold')
        
    //                     // JOIN kép:
    //                     // 1. Từ Products JOIN đến Variants bằng ProductID
    //                     ->join('ProductVariants', 'Products.ProductID', '=', 'ProductVariants.ProductID')
    //                     // 2. Từ Variants JOIN đến OrderItems bằng VariantID
    //                     ->join('OrderItems', 'ProductVariants.VariantID', '=', 'OrderItems.VariantID')
                        
    //                     // Bắt buộc phải Group By theo ProductID để SUM hoạt động đúng
    //                     ->groupBy('Products.ProductID')
                        
    //                     // Sắp xếp theo cột ảo 'total_sold' vừa tạo
    //                     ->orderByDesc('total_sold');
    //                 break;
    
    //         case 'newest':
    //             $query->orderBy('Products.ProductID', 'desc');
    //             break;
    
    //         case 'popular':
    //         default:
    //             $query->orderBy('Products.ProductID', 'desc');
    //             break;
    //     }
    
    //     // === BƯỚC 4: PHÂN TRANG ===
    //     $perPage = $request->input('per_page', 20);
    //     $paginatedProducts = $query->paginate($perPage);
    
    //     // === BƯỚC 5: BIẾN ĐỔI DỮ LIỆU ĐỂ KHỚP VỚI FRONTEND ===
    //     // (Giữ nguyên)
    //     $transformedProducts = $paginatedProducts->getCollection()->map(function ($product) {
    //         // ...
    //         return [
    //             'ProductID' => $product->ProductID,
    //             'Name'      => $product->Name,
    //             'images'    => $product->images->map(function ($image) {
    //                 return [
    //                     'ImageID'   => $image->ImageID,
    //                     'ImageURL'  => $image->ImageURL,
    //                     'IsPrimary' => $image->IsPrimary,
    //                 ];
    //             }),
    //             'variants'  => $product->variants->map(function ($variant) {
    //                 return [
    //                     'VariantID'      => $variant->VariantID,
    //                     'Price'          => $variant->Price,
    //                     'CompareAtPrice' => $variant->CompareAtPrice,
    //                 ];
    //             }),
    //             'category'  => [
    //                 'CategoryID'       => $product->category->CategoryID,
    //                 'Name'             => $product->category->Name,
    //                 'ParentCategoryID' => $product->category->ParentCategoryID,
    //             ]
    //         ];
    //     });
    
    //     // === BƯỚC 6: TRẢ VỀ RESPONSE JSON VỚI CẤU TRÚC ĐÚNG ===
    //     // (Giữ nguyên)
    //     return response()->json([
    //         'data'         => $transformedProducts,
    //         'total'        => $paginatedProducts->total(),
    //         'current_page' => $paginatedProducts->currentPage(),
    //         'last_page'    => $paginatedProducts->lastPage(),
    //     ]);
    // }
    public function showProductsCategory(Request $request, Category $category)
{
    // === BƯỚC 1: XÂY DỰNG QUERY CƠ BẢN VỚI EAGER LOADING SÂU ===
    // Tải trước tất cả dữ liệu cần thiết, bao gồm cả thuộc tính
    $query = Product::query()->with([
        'images',
        'category',
        // Tải biến thể và các mối quan hệ con của nó
        'variants.attributeValues.attribute'
    ]);

    // === BƯỚC 2: ÁP DỤNG CÁC BỘ LỌC (WHERE CLAUSES) ===
    
    // 2.1. Lọc theo danh mục (Giữ nguyên logic của bạn)
    if ($request->has('categories')) {
        $selectedCategoryIds = array_filter(explode(',', $request->input('categories')), 'is_numeric');
        if (!empty($selectedCategoryIds)) {
            $query->whereIn('CategoryID', $selectedCategoryIds); // Không cần tiền tố bảng ở đây
        }
    } else {
        $categoryIds = $this->getAllChildCategoryIds($category);
        $categoryIds[] = $category->CategoryID;
        $query->whereIn('CategoryID', $categoryIds);
    }
    
    // 2.2. Lọc theo khoảng giá (Giữ nguyên)
    if ($request->has('min_price') || $request->has('max_price')) {
        $query->whereHas('variants', function ($variantQuery) use ($request) {
            if ($request->filled('min_price') && is_numeric($request->input('min_price'))) {
                $variantQuery->where('Price', '>=', (float)$request->input('min_price'));
            }
            if ($request->filled('max_price') && is_numeric($request->input('max_price'))) {
                $variantQuery->where('Price', '<=', (float)$request->input('max_price'));
            }
        });
    }

    // 2.3. Lọc theo từ khóa tìm kiếm (Giữ nguyên)
    if ($request->filled('q')) {
        $searchTerm = $request->input('q');
        $query->where(function ($subQuery) use ($searchTerm) {
            $subQuery->where('Name', 'LIKE', '%' . $searchTerm . '%')
                     ->orWhere('Description', 'LIKE', '%' . $searchTerm . '%');
        });
    }

    // === BƯỚC 3: XỬ LÝ SẮP XẾP (ORDER BY & JOIN CLAUSES) ===
    $sort = $request->input('sort', 'popular');

    // Lưu ý: Các trường hợp sắp xếp có JOIN sẽ được xử lý cẩn thận hơn
    // để không làm mất dữ liệu Eager Loading.
    switch ($sort) {
        case 'price_asc':
        case 'price_desc':
            $direction = ($sort === 'price_asc') ? 'asc' : 'desc';
            $query->select('Products.*')
                  ->join('ProductVariants as pv_sort', 'Products.ProductID', '=', 'pv_sort.ProductID')
                  ->where('pv_sort.IsActive', 1)
                  // Chỉ lấy giá của biến thể rẻ/đắt nhất để sắp xếp
                  ->where('pv_sort.VariantID', function ($sub) {
                      $sub->select('VariantID')
                          ->from('ProductVariants')
                          ->whereColumn('ProductID', 'Products.ProductID')
                          ->where('IsActive', 1)
                          ->orderBy('Price', request()->input('sort') === 'price_asc' ? 'asc' : 'desc')
                          ->limit(1);
                  })
                  ->groupBy('Products.ProductID') // Group by các cột của bảng chính
                  ->orderBy('pv_sort.Price', $direction);
            break;

        case 'bestselling':
            $query->orderByDesc('SoldCount'); // Sắp xếp theo cột đã có sẵn, hiệu quả hơn
            break;

        case 'newest':
            $query->latest('Products.CreatedAt');
            break;

        case 'popular':
        default:
            $query->orderByDesc('viewCount')->latest('Products.CreatedAt');
            break;
    }

    // === BƯỚC 4: PHÂN TRANG ===
    $perPage = $request->input('per_page', 20);
    $paginatedProducts = $query->paginate($perPage);

    // === BƯỚC 5: BIẾN ĐỔI DỮ LIỆU & ÁP DỤNG "LƯỚI AN TOÀN" ===
    
    // Lấy collection từ Paginator
    $collection = $paginatedProducts->getCollection();

    // Biến đổi và lọc collection
    $finalCollection = $collection->map(function ($product) {
        // TÌM BIẾN THỂ CÓ GIÁ THẤP NHẤT
        $cheapestVariant = $product->variants
            ->where('IsActive', 1)
            ->where('StockQuantity', '>', 0)
            ->sortBy('Price')
            ->first();

        // TÍNH TOÁN CHUỖI THUỘC TÍNH
        $attributesText = null;
        if ($cheapestVariant && $cheapestVariant->attributeValues->isNotEmpty()) {
            $attributesText = $cheapestVariant->attributeValues->map(function ($av) {
                return optional($av->attribute)->Name . ': ' . $av->Value;
            })->implode(', ');
        }
        
        // TRẢ VỀ MỘT MẢNG ĐẦY ĐỦ THÔNG TIN
        return [
            'ProductID'       => $product->ProductID,
            'Name'            => $product->Name,
            'Price'           => $cheapestVariant ? round($cheapestVariant->Price) : null,
            'CompareAtPrice'  => $cheapestVariant ? round($cheapestVariant->CompareAtPrice) : null,
            'PrimaryImageURL' => $product->primaryImage?->ImageURL ?? $cheapestVariant?->ImageURL,
            'Attributes'      => $attributesText, // <<== TRƯỜNG MỚI
            // Giữ lại các trường khác nếu cần
            'images'          => $product->images,
            'variants'        => $product->variants,
            'category'        => $product->category,
        ];
    })->filter(function ($product) {
        // LỌC BỎ NHỮNG SẢN PHẨM KHÔNG CÓ THUỘC TÍNH
        return !empty($product['Attributes']);
    });

    // Cập nhật lại Paginator với collection đã được lọc và biến đổi
    $paginatedProducts->setCollection($finalCollection->values());
    
    // === BƯỚC 6: TRẢ VỀ RESPONSE JSON ===
    return response()->json($paginatedProducts);
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
    //  private function getAllChildCategoryIds(Category $category)
    // {
    //     $childIds = [];
    //     // Sử dụng eager loading cho quan hệ đệ quy để tối ưu
    //     $children = $category->load('allChildren')->allChildren;

    //     foreach ($children as $child) {
    //         $childIds[] = $child->CategoryID;
    //         if ($child->allChildren->isNotEmpty()) {
    //             $childIds = array_merge($childIds, $this->getAllChildCategoryIds($child));
    //         }
    //     }
    //     return $childIds;
    // }
    //}
}