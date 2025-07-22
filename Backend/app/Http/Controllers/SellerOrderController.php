<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\OrderBuyer;
use App\Models\Shop;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class SellerOrderController extends Controller
{
    public function index(Request $request)
    {
        $shop = Shop::where('UserID', Auth::id())->firstOrFail();

        if (!$shop) {
            return response()->json(['message' => 'Bạn không sở hữu cửa hàng nào.'], 404);
        }

        $shopId = $shop->ShopID;
        // $shopId = 2 ;
        // Truy vấn các đơn hàng (ordersbuyer) có chứa ít nhất một sản phẩm (orderitems)
        // mà sản phẩm đó thuộc về shop của người bán hiện tại.
        $orders = OrderBuyer::whereHas('orderItems.variant.product', function ($query) use ($shopId) {
            $query->where('ShopID', $shopId);
        })
        ->with([
            // Load các order items, nhưng chỉ những item thuộc về shop này
            'orderItems' => function ($query) use ($shopId) {
                $query->whereHas('variant.product', function ($subQuery) use ($shopId) {
                    $subQuery->where('ShopID', $shopId);
                })->with('variant.product:ProductID,Name'); // Lấy thêm tên sản phẩm
            }
        ])
        ->select('OrderID', 'OrderCode', 'OrderDate', 'OverallStatus', 'ShippingFullName', 'TotalAmount')
        ->orderBy('OrderDate', 'desc')
        ->paginate(15); // Phân trang, mỗi trang 15 đơn

        // Biến đổi kết quả để thêm tổng tiền của shop trong đơn hàng đó
        $orders->getCollection()->transform(function ($order) {
            $shopSubtotal = $order->orderItems->sum('Subtotal');
            $order->shop_subtotal = $shopSubtotal;
            return $order;
        });


        return response()->json($orders);
    }
     public function show($orderId)
    {
        $user = Auth::user();
        // Giả sử có quan hệ shop() trong User model
        $shop = $user->shop;

        if (!$shop) {
            return response()->json(['message' => 'Bạn không sở hữu cửa hàng nào.'], 403);
        }
        $shopId = $shop->ShopID;
       
        // $shopId = 2;
        
        // BƯỚC 1: TRUY VẤN DỮ LIỆU THÔ TỪ DATABASE
        // Query vẫn được tối ưu để chỉ lấy các dữ liệu cần thiết
        $order = OrderBuyer::where('OrderID', $orderId)
            ->whereHas('orderItems.variant.product', function ($query) use ($shopId) {
                $query->where('ShopID', $shopId);
            })
            ->with([
                'user:UserID,Username,Email',
                'address', // Tải toàn bộ object address
                'orderItems' => function ($query) use ($shopId) {
                    $query->whereHas('variant.product', function ($subQuery) use ($shopId) {
                        $subQuery->where('ShopID', $shopId);
                    });
                },
                'orderItems.variant:VariantID,SKU,ImageURL,ProductID',
                'orderItems.variant.product:ProductID,Name'
            ])
            ->firstOrFail();

        // BƯỚC 2: TẠO MỘT MẢNG DỮ LIỆU ĐỂ ĐỊNH DẠNG LẠI (TRANSFORM)
        // Đây là nơi chúng ta sẽ chuyển đổi sang camelCase và cấu trúc lại JSON
        $transformedData = [
            'orderId'           => $order->OrderID,
            'orderCode'         => $order->OrderCode,
            'orderDate'         => $order->OrderDate,
            'overallStatus'     => $order->OverallStatus,
            'shippingFullName'  => $order->ShippingFullName,
            'shippingPhoneNumber' => $order->ShippingPhoneNumber,
            'notes'             => $order->Notes,

            // Thông tin tài chính
            'totalAmount'       => $order->TotalAmount,
            'subtotalAmount'    => $order->SubtotalAmount,
            'shippingFee'       => $order->ShippingFee,
            'discountAmount'    => $order->DiscountAmount,
            'shopSubtotal'      => $order->orderItems->sum('Subtotal'), // Tính toán trực tiếp

            // Thông tin thanh toán
            'paymentMethod'     => $order->PaymentMethod,
            'paymentStatus'     => $order->PaymentStatus,

            // Dữ liệu từ các mối quan hệ (relations)
            'user' => $order->user ? [
                'username' => $order->user->Username,
                'email'    => $order->user->Email,
            ] : null,

            'address' => $order->address ? [
                'street'   => $order->address->Street,
                'ward'     => $order->address->Ward,
                'district' => $order->address->District,
                'city'     => $order->address->City,
            ] : null,

            // Định dạng lại mảng order_items
            'orderItems' => $order->orderItems->map(function ($item) {
                return [
                    'orderItemId'     => $item->OrderItemID,
                    'quantity'        => $item->Quantity,
                    'priceAtPurchase' => $item->PriceAtPurchase,
                    'subtotal'        => $item->Subtotal,
                    'isFlashSaleItem' => (bool)$item->IsFlashSaleItem,
                    'variant' => $item->variant ? [
                        'variantId' => $item->variant->VariantID,
                        'sku'       => $item->variant->SKU,
                        'imageUrl'  => $item->variant->ImageURL,
                        'product' => $item->variant->product ? [
                            'productId' => $item->variant->product->ProductID,
                            'name'      => $item->variant->product->Name,
                        ] : null,
                    ] : null,
                ];
            })->values(), // ->values() để reset keys của mảng thành 0, 1, 2...
        ];

        // BƯỚC 3: TRẢ VỀ JSON ĐÃ ĐƯỢC ĐỊNH DẠNG
        return response()->json($transformedData);
    }
}