<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\OrderBuyer;
use App\Models\Shop;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request; // ✅ để ở đây
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log; // ✅ để ở đây

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
            'proof_image1' => $order->proof_image1, 
            'proof_image2' => $order->proof_image2, 
            'reason'       => $order->Reason,
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
    if (!in_array($order->OverallStatus, ['Pending', 'Processing'])) {
        return response()->json(['message' => 'Chỉ có thể hủy đơn hàng ở trạng thái Pending hoặc Processing.'], 400);
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
    Log::info('>>>>>>> Received webhook from Shipping Manager:', $request->all());

    $status   = $request->input('status');
    $order_code = $request->input('order_id');

    // Base rules áp dụng cho tất cả status
    $baseRules = [
        'order_id' => 'required|string',
        'status'   => 'required|string',
    ];

    // Custom rules tùy theo status
    $customRules = [];

    if ($status === 'Delivered') {
        $customRules = [
            'proof_image1' => 'required|string',
            'proof_image2' => 'required|string',
        ];
    } elseif (in_array($status, ['DeliveryFailed', 'CancelledByBuyer'])) {
        $customRules = [
            'reason' => 'required|string|max:255',
        ];
    }
    
    // Validate dữ liệu
    $validated = $request->validate(array_merge($baseRules, $customRules));

    // Lấy order
     $order = OrderBuyer::where('OrderCode', $order_code)->first();
    if (!$order) {
        return response()->json(['message' => 'Order not found'], 404);
    }

    // Cập nhật dữ liệu
    $order->update([
        'OverallStatus' => $status,
        'proof_image1'  => $validated['proof_image1'] ?? null,
        'proof_image2'  => $validated['proof_image2'] ?? null,
        'reason'        => $validated['reason'] ?? null,
    ]);

    Log::info("✅ Order {$order_code} updated to status {$status}");

    return response()->json(['message' => 'Order updated successfully'], 200);
}

    public function shipOrder($orderId)
{
    $order = OrderBuyer::find($orderId);
    if (!$order) {
        return response()->json(['message' => 'Đơn hàng không tồn tại.'], 404);
    }
    if ($order->OverallStatus !== 'Processing') {
        return response()->json(['message' => 'Chỉ có thể xác nhận đã gửi khi đơn hàng đang chuẩn bị.'], 400);
    }
    $order->OverallStatus = 'Shipped';
    $order->save();

    return response()->json(['message' => 'Đơn hàng đã được xác nhận là đã gửi.', 'order' => $order], 200);
}
}