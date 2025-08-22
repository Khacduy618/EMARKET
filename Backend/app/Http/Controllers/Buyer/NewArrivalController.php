<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;

class NewArrivalController extends Controller
{
    public function index(Request $request)
    {
        // Eager load các relationship cần thiết để tối ưu query và sử dụng trong accessor
        $products = Product::with([
                'primaryImage', // Cần cho Product->main_image_url
                'images',       // Cần cho Product->main_image_url (fallback)
                'defaultVariant' => function ($query) { // Cần cho Product->tags_list và thông tin variant
                    $query->where('IsActive', true);
                }
            ])
            ->activeApproved() // Scope đã tạo
            ->orderByDesc('CreatedAt')
            ->take(30) // Lấy 4 sản phẩm
            ->get();

        // Chuyển đổi collection sang mảng với cấu trúc mong muốn
        $transformedProducts = $products->map(function ($product) {
            $variantData = null;
            if ($product->defaultVariant) {
                $variantData = [
                    // Sử dụng accessor từ ProductVariant model
                    'id' => $product->defaultVariant->VariantID,
                    'sku' => $product->defaultVariant->SKU,
                    'price' => $product->defaultVariant->Price, // Giá gốc (số nguyên)
                    'formatted_price' => $product->defaultVariant->formatted_price,
                    'compare_at_price' => $product->defaultVariant->CompareAtPrice, // Giá gốc so sánh (số nguyên)
                    'formatted_compare_at_price' => $product->defaultVariant->formatted_compare_at_price,
                    'stock_quantity' => $product->defaultVariant->StockQuantity,
                    'image_url' => $product->defaultVariant->variant_image_url, // Ảnh riêng của variant
                    'is_active' => $product->defaultVariant->IsActive,
                    'discount_percentage' => $product->defaultVariant->discount_percentage,
                ];
            }

            return [
                // Sử dụng accessor từ Product model
                'ProductID' => $product->ProductID,
                'name' => $product->Name,
                'slug' => $product->slug,
                'description' => $product->short_description, // Mô tả ngắn
                'full_description' => $product->Description,    // Mô tả đầy đủ (nếu cần)
                'image_url' => $product->main_image_url,    // Ảnh chính của sản phẩm
                'tags' => $product->tags_list,          // Danh sách tags
                'variant' => $variantData,                 // Thông tin variant mặc định
            ];
        });

        if ($transformedProducts->isEmpty()) {
            return response()->json([], 200); // Trả về mảng rỗng nếu không có sản phẩm
        }

        // Trả về mảng JSON trực tiếp
        return response()->json($transformedProducts);
    }
}