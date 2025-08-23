<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order; // Sử dụng Model OrderBuyer và đặt bí danh là Order
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class OrderItemController extends Controller
{
    /**
     * Hiển thị danh sách tất cả các sản phẩm (items)
     * thuộc về một đơn hàng cụ thể.
     *
     * @param  \App\Models\OrderBuyer $order
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Order $order): JsonResponse
    {
        try {
            // Sử dụng eager loading để tải các quan hệ cần thiết, tránh N+1 query
            $items = $order->orderItems()->with([
                'variant.product.shop:ShopID,ShopName', // Chỉ lấy ID và tên của shop
                'variant.attributes.attribute:AttributeID,Name',       // Chỉ lấy ID và tên của thuộc tính (Màu, Size)
                'variant.attributes.attributeValues:AttributeValueID,Value'   // Chỉ lấy ID và giá trị của thuộc tính
            ])->get();

            return response()->json([
                'success' => true,
                'message' => 'Lấy danh sách sản phẩm của đơn hàng thành công!',
                'data' => $items
            ]);

        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy danh sách item của đơn hàng ' . $order->OrderID . ': ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi lấy danh sách sản phẩm.'
            ], 500);
        }
    }

    /**
     * Hiển thị thông tin chi tiết của một mục sản phẩm (OrderItem) cụ thể.
     *
     * @param  \App\Models\OrderItem  $orderItem
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(OrderItem $orderItem): JsonResponse
    {
        try {
            // Laravel đã tự động tìm OrderItem cho bạn nhờ Route Model Binding.
            // Giờ chỉ cần tải thêm các thông tin liên quan.
            $orderItem->load([
                'order.user', // Thông tin người mua của đơn hàng chứa item này
                'variant.product.shop', // Thông tin đầy đủ của shop
                'variant.attributes.attribute',
                'variant.attributes.attributeValues'
            ]);

           // Trả về đúng biến $orderItem
           return response()->json([
                'success' => true,
                'message' => 'Lấy chi tiết mục sản phẩm thành công!',
                'data' => $orderItem
           ]);

       } catch (\Exception $e) {
            Log::error('Lỗi khi lấy chi tiết OrderItem ID ' . $orderItem->OrderItemID . ': ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi lấy chi tiết sản phẩm.'
            ], 500);
       }
    }

    // Nơi đây có thể chứa các phương thức khác trong tương lai như:
    // - Cập nhật số lượng của một item (nếu được phép)
    // - Xóa một item khỏi đơn hàng nháp
    // - Cập nhật trạng thái trả hàng cho một item cụ thể
}