<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Product; // Đảm bảo đã import Product model
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

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
        $product = Product::with([
            'shop', 
            'images', 
            'variants.attributeValues.attribute'
        ])
        ->whereHas('variants.attributeValues')
        ->find($productId);

        if (!$product) {
            return response()->json(['message' => 'Product not found.'], 404);
        }

        // --- BẮT ĐẦU TÍNH TOÁN CÁC CHỈ SỐ CHO SHOP ---

        // Lấy shop_id từ sản phẩm
        $shopId = $product->shop->ShopID;

        // Dùng withCount để đếm các mối quan hệ một cách hiệu quả
        // Giả sử bạn đã định nghĩa các relationship 'products', 'reviews', 'followers' trong Shop Model
        $shopWithStats = Shop::withCount(['products', /* 'reviews', 'followers' */])->find($shopId);

        // Định dạng lại các số liệu lớn (ví dụ: 12345 -> 12.3k)
        $ratingCountFormatted = $this->formatNumber(56000); // Tạm thời dùng số giả định
        $followerCountFormatted = $this->formatNumber(43800); // Tạm thời dùng số giả định
        
        // Tính toán thời gian tham gia
        // Đặt locale là tiếng Việt để có "năm trước", "tháng trước"...
        Carbon::setLocale('vi');
        $joinDuration = $shopWithStats->created_at ? $shopWithStats->created_at->diffForHumans(null, true) : 'N/A';
        // `diffForHumans(null, true)` sẽ cho kết quả như "4 năm" thay vì "4 năm trước"

        // Tạo mảng chứa các chỉ số thống kê
        $shopStats = [
            'rating_count'      => $ratingCountFormatted, // Ví dụ: "36k"
            'product_count'     => $shopWithStats->products_count ?? 0, // Lấy từ withCount
            'follower_count'    => $followerCountFormatted, // Ví dụ: "43,8k"
            'join_duration'     => $joinDuration, // Ví dụ: "4 năm"
            'response_rate'     => '79%', // Dữ liệu giả định
            'response_time'     => 'trong vài giờ', // Dữ liệu giả định
            'online_status'     => 'Online ' . rand(5, 50) . ' phút trước' // Dữ liệu giả định
        ];

        // --- KẾT THÚC TÍNH TOÁN ---

        // Tính toán giá và số lượng tồn kho của sản phẩm
        $totalOverallStockQuantity = 0;
        $minOverallPrice = null;

        foreach ($product->variants as $variant) {
            if ($variant->IsActive && $variant->StockQuantity > 0) {
                $totalOverallStockQuantity += $variant->StockQuantity;
                $priceToConsider = $variant->CompareAtPrice ?? $variant->Price;
                if ($minOverallPrice === null || $priceToConsider < $minOverallPrice) {
                    $minOverallPrice = $priceToConsider;
                }
            }
        }

        // Gộp tất cả dữ liệu lại
        $productArray = $product->toArray();
        $productArray['min_overall_price'] = $minOverallPrice;
        $productArray['total_overall_stock_quantity'] = $totalOverallStockQuantity;
        
        // ==> GẮN MẢNG CHỈ SỐ VÀO ĐỐI TƯỢNG SHOP <==
        $productArray['shop']['stats'] = $shopStats;

        return response()->json($productArray);
    }
    
    /**
     * Helper function to format large numbers (e.g., 43800 -> 43.8k)
     */
    private function formatNumber($num) {
        if ($num >= 1000) {
            $x = round($num);
            $x_number_format = number_format($x);
            $x_array = explode(',', $x_number_format);
            $x_parts = ['k', 'm', 'b', 't'];
            $x_count_parts = count($x_array) - 1;
            $x_display = $x_array[0] . ((int) $x_array[1][0] !== 0 ? '.' . $x_array[1][0] : '');
            $x_display .= $x_parts[$x_count_parts - 1];
            return $x_display;
        }
        return $num;
    }
}