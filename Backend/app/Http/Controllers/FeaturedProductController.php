<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FeaturedProductController extends Controller
{
    /**
     * Hàm này vẫn giữ nguyên để dùng cho sidebar hoặc trang chủ.
     */
    public function getFeaturedProductsByCategory()
    {
        // ... code cũ của bạn vẫn ở đây, không thay đổi ...
    }

    /**
     * HÀM MỚI: Lấy các sản phẩm liên quan.
     *
     * @param int $id ID của sản phẩm đang được xem.
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRelatedProducts($id)
    {
        // --- B1: Tìm CategoryID của sản phẩm hiện tại ---
        // Sử dụng Query Builder của Laravel cho an toàn và sạch sẽ
        $currentProduct = DB::table('Products')->select('CategoryID')->where('ProductID', $id)->first();

        // Nếu không tìm thấy sản phẩm, trả về mảng rỗng
        if (!$currentProduct) {
            return response()->json([]);
        }
        $categoryId = $currentProduct->CategoryID;


        // --- B2: Lấy các sản phẩm khác trong cùng CategoryID đó ---
        $limit = 3; // Số lượng sản phẩm liên quan muốn hiển thị

        // Sử dụng Query Builder để lấy dữ liệu.
        // Các alias (as product_id) được đặt tên để khớp với JSON mà frontend mong đợi.
        $relatedProducts = DB::table('Products as p')
            ->select(
                'p.ProductID as product_id',
                'p.Name as product_name',
                'p.Discount as discount',
                'p.viewCount as view_count',
                DB::raw('(SELECT MIN(pv.Price) FROM ProductVariants pv WHERE pv.ProductID = p.ProductID AND pv.IsActive = 1) as lowest_price'),
                DB::raw('(SELECT pi.ImageURL FROM ProductImages pi WHERE pi.ProductID = p.ProductID ORDER BY pi.IsPrimary DESC, pi.SortOrder ASC LIMIT 1) as image_url')
            )
            ->where('p.CategoryID', $categoryId)
            ->where('p.ProductID', '!=', $id)
            ->where('p.IsActive', 1)
            ->where('p.AdminApprovalStatus', 'Approved')

            // <-- THAY THẾ CHO whereHas BẰNG whereExists -->
            // Logic: Chỉ lấy sản phẩm (p) NẾU TỒN TẠI một biến thể (pv) của nó
            // mà biến thể đó lại có một bản ghi trong bảng ProductVariantAttribute (pva)
            ->whereExists(function ($query) {
                $query->select(DB::raw(1))
                      ->from('ProductVariants as pv')
                      ->join('ProductVariantAttribute as pva', 'pv.VariantID', '=', 'pva.VariantID')
                      // Điều kiện join quan trọng: biến thể phải thuộc về sản phẩm đang xét ở truy vấn bên ngoài
                      ->whereColumn('pv.ProductID', 'p.ProductID');
            })
            ->orderBy('p.viewCount', 'DESC')          // Sắp xếp theo lượt xem để lấy sản phẩm hot nhất
            ->limit($limit)                           // Giới hạn số lượng kết quả
            ->get();

        // Trả về kết quả dưới dạng JSON
        return response()->json($relatedProducts);
    }
}