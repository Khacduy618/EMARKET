<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    public function suggest(Request $request)
    {
        $keyword = $request->input('q');

        if (empty($keyword)) {
            return response()->json(['products' => [], 'shops' => []]);
        }

        // 1. Tìm sản phẩm gợi ý (lấy 5 sản phẩm)
        // Join với ảnh chính để hiển thị
        $products = Product::select('products.ProductID', 'products.Name')
            ->leftJoin('ProductImages', function ($join) {
                $join->on('products.ProductID', '=', 'ProductImages.ProductID')
                     ->where('ProductImages.IsPrimary', '=', 1);
            })
            ->addSelect('ProductImages.ImageURL')
            ->where('products.Name', 'LIKE', "%{$keyword}%")
            ->where('products.IsActive', 1)
            ->where('products.AdminApprovalStatus', 'Approved')
            ->limit(5)
            ->get();

        // 2. Tìm cửa hàng gợi ý (lấy 2 shop)
        $shops = Shop::select('ShopID', 'ShopName', 'LogoURL')
            ->where('ShopName', 'LIKE', "%{$keyword}%")
            ->where('Status', 'Approved')
            ->limit(2)
            ->get();
            
        return response()->json([
            'products' => $products,
            'shops' => $shops,
        ]);
    }

    /**
     * API Tìm kiếm chính (khi nhấn Enter/nút tìm kiếm).
     * Hỗ trợ lọc, sắp xếp, và phân trang.
     * URL: /api/search?q=iphone&category_id=1&sort_by=price_asc&page=1
     */
    public function search(Request $request)
    {
        $keyword = $request->input('q');

        // Bắt đầu xây dựng câu truy vấn phức tạp
        // Chúng ta cần lấy giá thấp nhất từ các biến thể (ProductVariants)
        $query = Product::select(
                'products.ProductID',
                'products.ShopID',
                'products.CategoryID',
                'products.Name',
                'products.Discount',
                // Lấy giá thấp nhất từ các biến thể của sản phẩm
                DB::raw('MIN(variants.Price) as Price')
            )
            ->from('products')
            // Join với ProductVariants để lấy giá và kiểm tra tồn kho
            ->join('ProductVariants as variants', 'products.ProductID', '=', 'variants.ProductID')
            // Chỉ lấy sản phẩm/biến thể đang hoạt động và được duyệt
            ->where('products.IsActive', 1)
            ->where('products.AdminApprovalStatus', 'Approved')
            ->where('variants.IsActive', 1)
            ->where('variants.StockQuantity', '>', 0) // Chỉ tìm sản phẩm còn hàng
            // Gom nhóm để hàm MIN() hoạt động đúng cho mỗi sản phẩm
            ->groupBy('products.ProductID');


        // 1. Lọc theo từ khóa (`q`)
        if ($keyword) {
            $query->where('products.Name', 'LIKE', "%{$keyword}%");
        }

        // 2. Lọc theo danh mục (`category_id`)
        if ($request->filled('category_id')) {
            $query->where('products.CategoryID', $request->input('category_id'));
        }

        // 3. Lọc theo khoảng giá (`min_price`, `max_price`)
        // Dùng `having` vì `Price` là một cột được tính toán (aggregated)
        if ($request->filled('min_price')) {
            $query->having('Price', '>=', $request->input('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->having('Price', '<=', $request->input('max_price'));
        }
        
        // 4. Sắp xếp kết quả (`sort_by`)
        $sortBy = $request->input('sort_by', 'relevance'); // Mặc định là 'liên quan'
        switch ($sortBy) {
            case 'latest':
                $query->orderBy('products.CreatedAt', 'desc');
                break;
            // Sắp xếp theo doanh số (cần có cột SoldCount trong bảng products)
            // case 'sales':
            //     $query->orderBy('products.SoldCount', 'desc');
            //     break;
            case 'price_asc':
                $query->orderBy('Price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('Price', 'desc');
                break;
        }

        // 5. Phân trang
        $perPage = $request->input('limit', 24); // Mặc định 24 sản phẩm/trang
        $results = $query->paginate($perPage);

        // Sau khi có kết quả đã phân trang, ta lấy thêm ảnh chính cho từng sản phẩm
        $results->getCollection()->transform(function ($product) {
            $primaryImage = DB::table('ProductImages')
                ->where('ProductID', $product->ProductID)
                ->where('IsPrimary', 1)
                ->value('ImageURL'); // Chỉ lấy URL
            
            $product->ImageURL = $primaryImage;
            return $product;
        });

        return response()->json($results);
    }
}