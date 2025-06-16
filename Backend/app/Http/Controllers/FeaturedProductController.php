<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // Quan trọng: import DB facade

class FeaturedProductController extends Controller
{
    /**
     * Lấy danh sách sản phẩm nổi bật theo từng danh mục.
     * Mỗi danh mục sẽ lấy ra 5 sản phẩm có lượt xem cao nhất.
     */
    public function getFeaturedProductsByCategory()
    {
        // Số lượng sản phẩm top muốn lấy cho mỗi danh mục
        $limitPerCategory = 5; 

        // Câu lệnh SQL gốc sử dụng CTE và ROW_NUMBER()
        $sql = "
            WITH RankedProducts AS (
                SELECT 
                    p.ProductID,
                    p.Name AS ProductName,
                    p.viewCount,
                    p.Discount,
                    c.CategoryID,
                    c.Name AS CategoryName,
                    (SELECT MIN(pv.Price) 
                     FROM ProductVariants pv 
                     WHERE pv.ProductID = p.ProductID AND pv.IsActive = 1) AS LowestPrice,
                    (SELECT pi.ImageURL 
                     FROM ProductImages pi 
                     WHERE pi.ProductID = p.ProductID 
                     ORDER BY pi.IsPrimary DESC, pi.SortOrder ASC 
                     LIMIT 1) AS PrimaryImageURL,
                    ROW_NUMBER() OVER(PARTITION BY p.CategoryID ORDER BY p.viewCount DESC) as ProductRank
                FROM 
                    Products p
                JOIN 
                    PlatformCategories c ON p.CategoryID = c.CategoryID
                WHERE 
                    p.IsActive = 1
                    AND p.AdminApprovalStatus = 'Approved'
                    AND c.IsActive = 1
            )
            SELECT 
                ProductID,
                ProductName,
                LowestPrice,
                Discount,
                viewCount,
                PrimaryImageURL,
                CategoryID,
                CategoryName
            FROM 
                RankedProducts
            WHERE 
                ProductRank <= ?
            ORDER BY 
                CategoryName ASC,
                ProductRank ASC;
        ";

        // Thực thi câu lệnh SQL
        $results = DB::select($sql, [$limitPerCategory]);

        // Nhóm các sản phẩm lại theo danh mục để có cấu trúc JSON đẹp
        $categories = [];
        foreach ($results as $product) {
            // Nếu danh mục chưa tồn tại trong mảng kết quả, khởi tạo nó
            if (!isset($categories[$product->CategoryID])) {
                $categories[$product->CategoryID] = [
                    'category_id' => $product->CategoryID,
                    'category_name' => $product->CategoryName,
                    'products' => [],
                ];
            }

            // Thêm sản phẩm vào danh mục tương ứng
            $categories[$product->CategoryID]['products'][] = [
                'product_id' => $product->ProductID,
                'product_name' => $product->ProductName,
                'lowest_price' => $product->LowestPrice,
                'discount' => $product->Discount,
                'view_count' => $product->viewCount,
                'image_url' => $product->PrimaryImageURL,
            ];
        }

        // Chuyển đổi mảng kết hợp thành mảng tuần tự và trả về JSON
        return response()->json(array_values($categories));
    }
}