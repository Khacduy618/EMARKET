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
    
}