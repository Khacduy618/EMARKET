<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\OrderBuyer;
use App\Models\Shop;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;

class SellerOrderController extends Controller
{
   public function index(Request $request)
{
    $shop = Shop::where('UserID', Auth::id())->firstOrFail();

    if (!$shop) {
        return response()->json(['message' => 'Bạn không sở hữu cửa hàng nào.'], 404);
    }

    $shopId = $shop->ShopID;
    $status = $request->query('status'); // lấy status từ query

    $ordersQuery = OrderBuyer::whereHas('orderItems.variant.product', function ($query) use ($shopId) {
        $query->where('ShopID', $shopId);
    });

    if ($status && $status !== 'all') {
        $ordersQuery->where('OverallStatus', $status);
    }

    $orders = $ordersQuery
        ->with([
            'orderItems' => function ($query) use ($shopId) {
                $query->whereHas('variant.product', function ($subQuery) use ($shopId) {
                    $subQuery->where('ShopID', $shopId);
                })->with('variant.product:ProductID,Name');
            }
        ])
        ->select('OrderID', 'OrderCode', 'OrderDate', 'OverallStatus', 'ShippingFullName', 'TotalAmount')
        ->orderBy('OrderDate', 'desc')
        ->paginate(15);

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
        $shop = $user->shop;

        if (!$shop) {
            return response()->json(['message' => 'Bạn không sở hữu cửa hàng nào.'], 403);
        }
        $shopId = $shop->ShopID;

        $order = OrderBuyer::where('OrderID', $orderId)
            ->whereHas('orderItems.variant.product', function ($query) use ($shopId) {
                $query->where('ShopID', $shopId);
            })
            ->with([
                'user:UserID,Username,Email',
                'address',
                'orderItems' => function ($query) use ($shopId) {
                    $query->whereHas('variant.product', function ($subQuery) use ($shopId) {
                        $subQuery->where('ShopID', $shopId);
                    });
                },
                'orderItems.variant:VariantID,SKU,ImageURL,ProductID',
                'orderItems.variant.product:ProductID,Name'
            ])
            ->firstOrFail();

        $transformedData = [
            'orderId'           => $order->OrderID,
            'orderCode'         => $order->OrderCode,
            'orderDate'         => $order->OrderDate,
            'overallStatus'     => $order->OverallStatus,
            'shippingFullName'  => $order->ShippingFullName,
            'shippingPhoneNumber' => $order->ShippingPhoneNumber,
            'notes'             => $order->Notes,
            'totalAmount'       => $order->TotalAmount,
            'subtotalAmount'    => $order->SubtotalAmount,
            'shippingFee'       => $order->ShippingFee,
            'discountAmount'    => $order->DiscountAmount,
            'shopSubtotal'      => $order->orderItems->sum('Subtotal'),
            'paymentMethod'     => $order->PaymentMethod,
            'paymentStatus'     => $order->PaymentStatus,
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
            })->values(),
        ];

        return response()->json($transformedData);
    }

    public function confirmOrder($orderId)
    {
        $order = OrderBuyer::find($orderId);
        if (!$order) {
            return response()->json(['message' => 'Đơn hàng không tồn tại.'], 404);
        }
        if ($order->OverallStatus !== 'Pending') {
            return response()->json(['message' => 'Chỉ có thể xác nhận đơn hàng ở trạng thái Pending.'], 400);
        }
        $order->OverallStatus = 'Processing';
        $order->save();

        return response()->json(['message' => 'Đơn hàng đã được xác nhận và đang chuẩn bị.', 'order' => $order], 200);
    }

    public function cancelOrder($orderId)
    {
        $order = OrderBuyer::find($orderId);
        if (!$order) {
            return response()->json(['message' => 'Đơn hàng không tồn tại.'], 404);
        }
        if ($order->OverallStatus !== 'Pending') {
            return response()->json(['message' => 'Chỉ có thể hủy đơn hàng ở trạng thái Pending.'], 400);
        }
        $order->OverallStatus = 'CancelledBySeller';
        $order->save();

        return response()->json(['message' => 'Đơn hàng đã được hủy.', 'order' => $order], 200);
    }

    public function printShippingLabel($orderId)
{
    $order = OrderBuyer::find($orderId);
    if (!$order) {
        return response()->json(['message' => 'Đơn hàng không tồn tại.'], 404);
    }

    try {
        $pdf = Pdf::loadView('pdf.shipping_label', ['order' => $order]);
        $pdf->setOptions(['defaultFont' => 'DejaVu Sans']);
        return response($pdf->output(), 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="shipping_label_' . $orderId . '.pdf"');
    } catch (\Exception $e) {
        Log::error('PDF Generation Error for order ' . $orderId . ': ' . $e->getMessage());
        return response()->json(['message' => 'Lỗi tạo PDF: ' . $e->getMessage()], 500);
    }
}
   public function handle(Request $request)
    {
        // Log lại để kiểm tra nhận đúng chưa
        Log::info('📦 Nhận webhook từ giao hàng:', $request->all());

        // Validate dữ liệu đến
        $validated = $request->validate([
            'order_id' => 'required|string',
            'status' => 'required|string',
            'updated_at' => 'required|date',
        ]);

        // Cập nhật trạng thái đơn hàng trong hệ thống của seller
        $order = OrderBuyer::where('OrderID', $validated['order_id'])->first();

        if ($order) {
            $order->OverallStatus = $validated['status'];
            $order->UpdatedAt = $validated['updated_at']; // Nếu có cột riêng
            $order->save();

            return response()->json(['message' => 'Order updated'], 200);
        } else {
            return response()->json(['message' => 'Order not found'], 404);
        }
    }
}