<?php

// namespace App\Http\Controllers;

// use App\Http\Controllers\Controller;
// use App\Models\Product; // Đảm bảo đã import Product model
// use Illuminate\Http\Request;

// class ProductDetailController extends Controller
// {
//     /**
//      * Display the specified product details.
//      *
//      * @param  int  $productId
//      * @return \Illuminate\Http\JsonResponse
//      */
//     public function show($productId)
//     {
//         // Eager load relationships: images, variants, and each variant's attributes
//         $product = Product::with(['images', 'variants.AttributeValues'])->find($productId);
//         // Eager load relationships: images, variants, and each variant's attribute values
//         $product = Product::with(['images', 'variants.attributeValues.attribute'])->find($productId);

//         if (!$product) {
//             return response()->json([
//                 'message' => 'Product not found.'
//             ], 404);
//         }

//         // Tính toán tổng số lượng tồn kho và giá CompareAtPrice thấp nhất cho tất cả các biến thể
//         $totalOverallStockQuantity = 0;
//         $minOverallCompareAtPrice = null; // Khởi tạo là null
//         $minRegularPriceIfNoCompareAt = null; // Để fallback nếu không có CompareAtPrice nào

//         foreach ($product->variants as $variant) {
//             // Chỉ xem xét các biến thể đang hoạt động và còn hàng
//             if ($variant->IsActive && $variant->StockQuantity > 0) {
//                 $totalOverallStockQuantity += $variant->StockQuantity;

//                 $priceToConsider = $variant->CompareAtPrice ?? $variant->Price;

//                 if ($minOverallCompareAtPrice === null || $priceToConsider < $minOverallCompareAtPrice) {
//                     $minOverallCompareAtPrice = $priceToConsider;
//                 }
//             }
//         }

//         // Tạo một bản sao của product để thêm các thuộc tính mới mà không làm thay đổi model gốc
//         $productArray = $product->toArray();
//         $productArray['min_overall_compare_at_price'] = $minOverallCompareAtPrice;
//         $productArray['total_overall_stock_quantity'] = $totalOverallStockQuantity;

//         return response()->json($productArray);
//     }
// }
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Product; // Đảm bảo đã import Product model
use Illuminate\Http\Request;

class ProductDetailController extends Controller
{
    /**
     * Display the specified product details.
     *
     * @param  int  $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($productId)
    {
        // SỬA ĐỔI CHÍNH:
        // Sử dụng whereHas để đảm bảo sản phẩm chỉ được trả về
        // NẾU nó có ít nhất một biến thể (variant) VÀ biến thể đó có ít nhất một giá trị thuộc tính (attribute value).
        // Cú pháp 'variants.attributeValues' kiểm tra mối quan hệ lồng nhau.
        $product = Product::with([
            'images',
            'variants.attributeValues.attribute' // Eager load tất cả dữ liệu cần thiết trong một lần gọi
        ])
        ->whereHas('variants.attributeValues') // <<== ĐÂY LÀ ĐIỀU KIỆN CỐT LÕI
        ->find($productId); // Tìm sản phẩm với ID cụ thể VÀ đã thỏa mãn điều kiện whereHas

        // Nếu không tìm thấy sản phẩm (hoặc sản phẩm không thỏa mãn điều kiện)
        if (!$product) {
            return response()->json([
                'message' => 'Product not found or has no variants with attributes.' // Cập nhật thông báo lỗi cho rõ ràng hơn
            ], 404);
        }

        // Tính toán tổng số lượng tồn kho và giá thấp nhất cho tất cả các biến thể
        $totalOverallStockQuantity = 0;
        $minOverallPrice = null; // Đổi tên biến để rõ ràng hơn, vì nó có thể là Price hoặc CompareAtPrice

        foreach ($product->variants as $variant) {
            // Chỉ xem xét các biến thể đang hoạt động và còn hàng
            if ($variant->IsActive && $variant->StockQuantity > 0) {
                $totalOverallStockQuantity += $variant->StockQuantity;

                // Ưu tiên CompareAtPrice nếu có, nếu không thì lấy Price
                $priceToConsider = $variant->CompareAtPrice ?? $variant->Price;

                // Tìm giá thấp nhất
                if ($minOverallPrice === null || $priceToConsider < $minOverallPrice) {
                    $minOverallPrice = $priceToConsider;
                }
            }
        }

        // Tạo một bản sao của product để thêm các thuộc tính mới mà không làm thay đổi model gốc
        $productArray = $product->toArray();
        $productArray['min_overall_price'] = $minOverallPrice; // Sử dụng tên mới
        $productArray['total_overall_stock_quantity'] = $totalOverallStockQuantity;

        return response()->json($productArray);
    }
}