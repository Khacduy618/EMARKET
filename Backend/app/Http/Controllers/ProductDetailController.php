<?php

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
        // Eager load relationships: images, variants, and each variant's attribute values
        $product = Product::with(['images', 'variants.attributeValues.attribute'])->find($productId);

        if (!$product) {
            return response()->json([
                'message' => 'Product not found.'
            ], 404);
        }

        // Tính toán tổng số lượng tồn kho và giá CompareAtPrice thấp nhất cho tất cả các biến thể
        $totalOverallStockQuantity = 0;
        $minOverallCompareAtPrice = null; // Khởi tạo là null
        $minRegularPriceIfNoCompareAt = null; // Để fallback nếu không có CompareAtPrice nào

        foreach ($product->variants as $variant) {
            // Chỉ xem xét các biến thể đang hoạt động và còn hàng
            if ($variant->IsActive && $variant->StockQuantity > 0) {
                $totalOverallStockQuantity += $variant->StockQuantity;

                $priceToConsider = $variant->CompareAtPrice ?? $variant->Price;

                if ($minOverallCompareAtPrice === null || $priceToConsider < $minOverallCompareAtPrice) {
                    $minOverallCompareAtPrice = $priceToConsider;
                }
            }
        }

        // Tạo một bản sao của product để thêm các thuộc tính mới mà không làm thay đổi model gốc
        $productArray = $product->toArray();
        $productArray['min_overall_compare_at_price'] = $minOverallCompareAtPrice;
        $productArray['total_overall_stock_quantity'] = $totalOverallStockQuantity;

        return response()->json($productArray);
    }
}