<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;

class OrderItemController extends Controller
{
    /**
     * Hiển thị danh sách tất cả các sản phẩm (items)
     * thuộc về một đơn hàng cụ thể.
     *
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Order $order)
    {
        // Nhờ vào Route Model Binding, Laravel đã tự tìm Order cho chúng ta.
        // Bây giờ, chúng ta chỉ cần lấy các 'items' liên quan đến nó.

        // Sử dụng `with()` để tải kèm thông tin của variant và sản phẩm chính.
        // Điều này giúp tránh lỗi N+1 query và cung cấp đủ dữ liệu cho frontend.
        // Giả sử mối quan hệ của bạn là: OrderItem -> variant -> product
        $items = $order->items()->with('variant.product')->get();

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách sản phẩm của đơn hàng thành công!',
            'data' => $items
        ]);
    }

    /**
     * Hiển thị thông tin chi tiết của một mục sản phẩm (OrderItem) cụ thể.
     *
     * @param  \App\Models\OrderItem  $orderItem
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(OrderItem $orderItem)
    {
        // Laravel đã tự động tìm OrderItem dựa trên ID từ URL.
        // Chúng ta chỉ cần tải thêm các thông tin liên quan.
        $orderItem->load(['order.user', 'variant.product']);

       return response()->json([
        'success' => true,
        'message' => 'Lấy chi tiết đơn hàng thành công!',
        'data' => $order // Dữ liệu $order bây giờ đã chứa cả 'items' bên trong
    ]);
    }

    // Các phương thức khác như store, update, destroy sẽ ở đây...
}