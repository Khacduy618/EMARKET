<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class SearchController extends Controller
{
    public function suggest(Request $request)
    {
        $keyword = $request->input('q');

        if (empty($keyword)) {
            return response()->json(['Products' => [], 'Shops' => []]);
        }

        // 1. Tìm sản phẩm gợi ý (lấy 5 sản phẩm)
        // Join với ảnh chính để hiển thị
        $products = Product::select('Products.ProductID', 'Products.Name')
            ->leftJoin('ProductImages', function ($join) {
                $join->on('Products.ProductID', '=', 'ProductImages.ProductID')
                     ->where('ProductImages.IsPrimary', '=', 1);
            })
            ->addSelect('ProductImages.ImageURL')
            ->where('Products.Name', 'LIKE', "%{$keyword}%")
            ->where('Products.IsActive', 1)
            ->where('Products.AdminApprovalStatus', 'Approved')
            ->limit(5)
            ->get();

        // 2. Tìm cửa hàng gợi ý (lấy 2 shop)
        $shops = Shop::select('ShopID', 'ShopName', 'LogoURL')
            ->where('ShopName', 'LIKE', "%{$keyword}%")
            ->where('Status', 'Approved')
            ->limit(2)
            ->get();
            
        return response()->json([
            'Products' => $products,
            'shops' => $shops,
        ]);
    }

    /**
     * API Tìm kiếm chính (khi nhấn Enter/nút tìm kiếm).
     * Hỗ trợ lọc, sắp xếp, và phân trang.
     * URL: /api/search?q=iphone&category_id=1&sort_by=price_asc&page=1
     */
  // Đừng quên thêm dòng này ở đầu file Controller nếu chưa có


// ...

public function search(Request $request)
{
    // --- 1. Lấy và làm sạch dữ liệu đầu vào ---
    $keyword = $request->input('q');
    $explicitCategoryId = $request->input('category_id'); // ID được gửi tường minh
    $trimmedKeyword = $keyword ? trim($keyword) : null;

    $categoryIdsToSearch = [];

    // --- 2. Xác định phương thức tìm kiếm ---

    // Ưu tiên 1: Người dùng chọn một category cụ thể từ bộ lọc
    if ($explicitCategoryId) {
        // Tìm kiếm trong category này và các con của nó
        $categoryIdsToSearch = $this->getCategoryWithChildrenIds($explicitCategoryId);
    } 
    // Ưu tiên 2: Từ khóa tìm kiếm khớp với tên một category nào đó
    else if ($trimmedKeyword) {
        $category = Category::where('Name', 'LIKE', $trimmedKeyword)->first();
        
        if ($category) {
            // ĐÂY LÀ LOGIC ĐÚNG:
            // Nếu `q` khớp với tên một category, chỉ tìm trong category đó và các con của nó.
            // KHÔNG leo ngược lên cha.
            $categoryIdsToSearch = $this->getCategoryWithChildrenIds($category->CategoryID);
        }
    }

    // --- 3. Bắt đầu xây dựng câu truy vấn ---
    $query = Product::select(
            'Products.ProductID', 'Products.ShopID', 'Products.CategoryID', 'Products.Name', 
            'Products.Discount', 'Products.SoldCount', 'Products.CreatedAt',
            DB::raw('MIN(variants.Price) as Price')
        )
        ->join('ProductVariants as variants', 'Products.ProductID', '=', 'variants.ProductID')
        ->where('Products.IsActive', 1)
        ->where('Products.AdminApprovalStatus', 'Approved')
        ->where('variants.IsActive', 1)
        ->where('variants.StockQuantity', '>', 0)
        ->groupBy(
            'Products.ProductID', 'Products.ShopID', 'Products.CategoryID', 'Products.Name', 
            'Products.Discount', 'Products.SoldCount', 'Products.CreatedAt'
        );

    // --- 4. Áp dụng các bộ lọc ---

    // Nếu đã xác định được một nhóm category để tìm kiếm (từ bước 2)
    if (!empty($categoryIdsToSearch)) {
        $query->whereIn('Products.CategoryID', $categoryIdsToSearch);
    } 
    // Ngược lại, nếu không phải tìm theo category, thì tìm theo tên sản phẩm
    else if ($trimmedKeyword) {
        $query->where('Products.Name', 'LIKE', '%' . $trimmedKeyword . '%');
    }

    // (Các bộ lọc khác như giá, sắp xếp... giữ nguyên)
    if ($request->filled('min_price')) {
        $query->having('Price', '>=', $request->input('min_price'));
    }
    if ($request->filled('max_price')) {
        $query->having('Price', '<=', $request->input('max_price'));
    }
    
    $sortBy = $request->input('sort', 'popular');
    switch ($sortBy) {
        case 'newest': $query->orderBy('Products.CreatedAt', 'desc'); break;
        case 'bestselling': $query->orderBy('Products.SoldCount', 'desc'); break;
        case 'price_asc': $query->orderBy('Price', 'asc'); break;
        case 'price_desc': $query->orderBy('Price', 'desc'); break;
        default: $query->orderBy('Products.SoldCount', 'desc')->orderBy('Products.CreatedAt', 'desc'); break;
    }

    // --- 5. Phân trang và trả về kết quả ---
    $perPage = $request->input('limit', 24);
    $results = $query->paginate($perPage);
    
    // (Lấy ảnh... giữ nguyên)
    if ($results->isNotEmpty()) {
        // 1. Lấy ID của tất cả sản phẩm trên trang hiện tại
        // Ví dụ: [113, 114, 337, 338, 339, ...]
        $productIds = $results->pluck('ProductID')->all();
    
        // 2. Truy vấn vào bảng `ProductImages`
        $images = DB::table('ProductImages')
            // Chỉ lấy ảnh của các sản phẩm ở trên
            ->whereIn('ProductID', $productIds) 
            // QUAN TRỌNG: Chỉ lấy những ảnh được đánh dấu là ảnh chính (ảnh đại diện)
            ->where('IsPrimary', 1) 
            // 3. Tạo ra một mảng kết quả hiệu quả, với key là ProductID và value là ImageURL
            // Ví dụ: [ 113 => '/url/image_a.jpg', 337 => '/url/image_b.jpg' ]
            ->pluck('ImageURL', 'ProductID');
    
        // 4. Lặp qua từng sản phẩm trong kết quả và gán URL ảnh tương ứng vào
        $results->getCollection()->transform(function ($product) use ($images) {
            $product->ImageURL = $images->get($product->ProductID);
            return $product;
        });
    }

    return response()->json($results);
}


/**
 * Lấy ID của một danh mục và tất cả các con cháu của nó.
 *
 * @param int $categoryId
 * @return array
 */
private function getCategoryWithChildrenIds($categoryId) {
    $ids = [$categoryId];
    $children = Category::where('ParentCategoryID', $categoryId)->get();
    foreach ($children as $child) {
        $ids = array_merge($ids, $this->getCategoryWithChildrenIds($child->CategoryID));
    }
    return array_unique($ids);
}
/*
 HÀM TÌM HEARDER
 */
// public function searchAll(Request $request)
// {
//     // --- 1. Lấy và chuẩn hóa đầu vào ---
//     $keyword = $request->input('q');
//     $trimmedKeyword = $keyword ? trim($keyword) : null;
//     $unaccentedKeyword = $trimmedKeyword ? $this->removeVietnameseAccents($trimmedKeyword) : null;

//     // --- 2. Bắt đầu xây dựng câu truy vấn cơ sở ---
//     $query = Product::query()
//         ->select([
//             'Products.ProductID',
//             'Products.CategoryID',
//             'Products.Name',
//             'Products.SoldCount',
//             'Products.CreatedAt',
//             // Sửa subquery: Vẫn lấy giá nhỏ nhất, nhưng chỉ cần biến thể IsActive, không cần còn hàng.
//             // Nếu không có biến thể nào, giá sẽ là NULL.
//             DB::raw('(SELECT MIN(price) FROM ProductVariants WHERE ProductID = Products.ProductID AND IsActive = 1) as Price')
//         ]);
//         // BỎ HẾT CÁC ĐIỀU KIỆN LỌC CỨNG BAN ĐẦU
//         // ->where('Products.IsActive', 1) // <- Bỏ đi
//         // ->where('Products.AdminApprovalStatus', 'Approved') // <- Bỏ đi
//         // ->whereExists(...) // <- Bỏ đi

//     // --- 3. Áp dụng các bộ lọc một cách linh hoạt ---

//     // Lọc theo từ khóa (nếu có)
//     if ($unaccentedKeyword) {
//         $query->where(DB::raw("LOWER(CONVERT(Products.Name USING utf8mb4))"), 'LIKE', '%' . mb_strtolower($unaccentedKeyword) . '%');
//     }

//     // Lọc theo Category (nếu có)
//     if ($request->filled('category_id')) {
//         $categoryIds = $this->getCategoryWithChildrenIds($request->input('category_id'));
//         if (!empty($categoryIds)) {
//             $query->whereIn('Products.CategoryID', $categoryIds);
//         }
//     }

//     // Lọc theo khoảng giá (vẫn giữ lại)
//     $minPrice = $request->input('min_price');
//     $maxPrice = $request->input('max_price');
//     if ($minPrice || $maxPrice) {
//          $query->where(function ($q) use ($minPrice, $maxPrice) {
//             $subQueryPrice = DB::raw('(SELECT MIN(price) FROM ProductVariants WHERE ProductID = Products.ProductID AND IsActive = 1)');
//             if ($minPrice) {
//                 $q->where($subQueryPrice, '>=', $minPrice);
//             }
//             if ($maxPrice) {
//                 $q->where($subQueryPrice, '<=', $maxPrice);
//             }
//         });
//     }
    
//     // Sắp xếp (vẫn giữ lại)
//     $sortBy = $request->input('sort', 'popular');
//     $query->when($sortBy === 'newest', fn($q) => $q->orderByDesc('Products.CreatedAt'))
//           ->when($sortBy === 'bestselling', fn($q) => $q->orderByDesc('Products.SoldCount'))
//           ->when($sortBy === 'price_asc', fn($q) => $q->orderBy('Price', 'asc'))
//           ->when($sortBy === 'price_desc', fn($q) => $q->orderBy('Price', 'desc'))
//           ->when(!in_array($sortBy, ['newest', 'bestselling', 'price_asc', 'price_desc']), fn($q) => $q->orderByDesc('Products.SoldCount')->orderByDesc('Products.CreatedAt'));

//     // --- 4. Phân trang và trả về kết quả ---
//     $perPage = $request->input('limit', 24);
//     $results = $query->paginate($perPage);
    
//     // Gán ảnh vào kết quả
//     if ($results->isNotEmpty()) {
//         $this->attachImagesToCollection($results);
//     }

//     return response()->json($results);
// }
public function searchAll(Request $request)
{
    // --- 1. Lấy và chuẩn hóa đầu vào ---
    $keyword = $request->input('q');
    $trimmedKeyword = $keyword ? trim($keyword) : null;
    $unaccentedKeyword = $trimmedKeyword ? $this->removeVietnameseAccents($trimmedKeyword) : null;

    // --- 2. Bắt đầu xây dựng câu truy vấn cơ sở ---
    $query = Product::query()
        ->select([
            'Products.ProductID',
            'Products.CategoryID',
            'Products.Name',
            'Products.SoldCount',
            'Products.CreatedAt',
            DB::raw('(SELECT MIN(price) FROM ProductVariants WHERE ProductID = Products.ProductID AND IsActive = 1) as Price')
        ]);
        // Hàm này không có bất kỳ bộ lọc cứng nào (IsActive, StockQuantity)

    // --- 3. Áp dụng các bộ lọc ---

    // LỌC SƠ BỘ BẰNG SQL NẾU CÓ TỪ KHÓA (Logic Fuzzy Search)
    if ($unaccentedKeyword) {
        $searchWords = array_filter(explode(' ', mb_strtolower($unaccentedKeyword)));
        if (!empty($searchWords)) {
            $query->where(function ($q) use ($searchWords) {
                foreach ($searchWords as $word) {
                    // Tìm các sản phẩm có tên chứa BẤT KỲ từ nào trong từ khóa
                    $q->orWhere(DB::raw("LOWER(CONVERT(Products.Name USING utf8mb4))"), 'LIKE', '%' . $word . '%');
                }
            });
        }
    }
    
    // Áp dụng các bộ lọc khác (category, giá)
    if ($request->filled('category_id')) {
        $categoryIds = $this->getCategoryWithChildrenIds($request->input('category_id'));
        if (!empty($categoryIds)) $query->whereIn('Products.CategoryID', $categoryIds);
    }
    $minPrice = $request->input('min_price');
    $maxPrice = $request->input('max_price');
    if ($minPrice || $maxPrice) {
         $query->where(function ($q) use ($minPrice, $maxPrice) {
            $subQueryPrice = DB::raw('(SELECT MIN(price) FROM ProductVariants WHERE ProductID = Products.ProductID AND IsActive = 1)');
            if ($minPrice) $q->where($subQueryPrice, '>=', $minPrice);
            if ($maxPrice) $q->where($subQueryPrice, '<=', $maxPrice);
        });
    }
    
    // Lấy tất cả kết quả tiềm năng từ DB để chấm điểm
    $potentialResults = $query->limit(200)->get();

    // --- 4. CHẤM ĐIỂM ĐỘ LIÊN QUAN VÀ SẮP XẾP BẰNG PHP ---
    $rankedResults = $potentialResults->map(function ($product) use ($unaccentedKeyword) {
        if ($unaccentedKeyword) {
            $productNameUnaccented = mb_strtolower($this->removeVietnameseAccents($product->Name));
            $keywordLower = mb_strtolower($unaccentedKeyword);
            
            similar_text($productNameUnaccented, $keywordLower, $similarityScore); 
            if (str_contains($productNameUnaccented, $keywordLower)) $similarityScore += 50;
            $product->relevance_score = $similarityScore;
        } else {
            $product->relevance_score = 0;
        }
        return $product;
    });

    // Sắp xếp collection dựa trên yêu cầu từ người dùng
    $sortBy = $request->input('sort', 'popular');
    
    if ($sortBy === 'newest') {
        $sortedResults = $rankedResults->sortByDesc('CreatedAt');
    } elseif ($sortBy === 'bestselling') {
        $sortedResults = $rankedResults->sortByDesc('SoldCount');
    } elseif ($sortBy === 'price_asc') {
        $sortedResults = $rankedResults->sortBy('Price');
    } elseif ($sortBy === 'price_desc') {
        $sortedResults = $rankedResults->sortByDesc('Price');
    } else { // Mặc định là 'popular' (Phổ biến/Liên quan)
        $sortedResults = $rankedResults->sort(function ($a, $b) {
            if ($a->relevance_score !== $b->relevance_score) {
                return $b->relevance_score <=> $a->relevance_score;
            }
            return $b->SoldCount <=> $a->SoldCount;
        });
    }
    
    // --- 5. Phân trang thủ công kết quả đã sắp xếp ---
    $perPage = $request->input('limit', 24);
    $currentPage = \Illuminate\Pagination\Paginator::resolveCurrentPage('page');
    
    $currentPageItems = $sortedResults->slice(($currentPage - 1) * $perPage, $perPage)->all();

    $results = new \Illuminate\Pagination\LengthAwarePaginator(
        array_values($currentPageItems), $sortedResults->count(), $perPage, $currentPage,
        ['path' => \Illuminate\Pagination\Paginator::resolveCurrentPath()]
    );
    
    if ($results->isNotEmpty()) {
        $this->attachImagesToCollection($results);
    }

    return response()->json($results);
}
    //======================================================================
    // CÁC PHƯƠNG THỨC HỖ TRỢ (PRIVATE)
    //======================================================================

    /**
     * Gán URL ảnh chính vào một collection các sản phẩm.
     */
    private function attachImagesToCollection($collection)
    {
        $productIds = $collection->pluck('ProductID')->all();
        
        $images = DB::table('ProductImages')
            ->whereIn('ProductID', $productIds)
            ->where('IsPrimary', 1)
            ->pluck('ImageURL', 'ProductID');

        $collection->each(function ($product) use ($images) {
            $product->ImageURL = $images->get($product->ProductID);
        });
    }

    /**
     * Phương thức private để loại bỏ dấu tiếng Việt, không phân biệt hoa thường.
     */
    private function removeVietnameseAccents($str)
    {
        $patterns = [
            '/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/i',
            '/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/i',
            '/(ì|í|ị|ỉ|ĩ)/i',
            '/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/i',
            '/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/i',
            '/(ỳ|ý|ỵ|ỷ|ỹ)/i',
            '/(đ)/i'
        ];
        $replacements = ['a', 'e', 'i', 'o', 'u', 'y', 'd'];
        return preg_replace($patterns, $replacements, $str);
    }

    private function collectChildrenIds($category, &$ids)
    {
        foreach ($category->childrenRecursive as $child) {
            $ids[] = $child->CategoryID;
            if ($child->childrenRecursive->isNotEmpty()) {
                $this->collectChildrenIds($child, $ids);
            }
        }
    }
    
}