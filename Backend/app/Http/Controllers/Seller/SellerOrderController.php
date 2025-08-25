<?php


namespace App\Http\Controllers\Seller;


use App\Http\Controllers\Controller;
use App\Models\OrderBuyer;
use App\Models\OrderSeller;
use App\Models\Shop;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request; // ✅ để ở đây
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log; // ✅ để ở đây
use App\Services\WebhookService;
class SellerOrderController extends Controller
{
     protected $webhookService;


    public function __construct(WebhookService $webhookService)
    {
        $this->webhookService = $webhookService;
    }
   public function index(Request $request)
{
    $shop = Shop::where('UserID', Auth::id() )->firstOrFail();


    if (!$shop) {
        return response()->json(['message' => 'Bạn không sở hữu cửa hàng nào.'], 404);
    }


    $shopId = $shop->ShopID;
    $status = $request->query('status');
    $searchTerm = $request->query('search');


    // Lấy danh sách đơn hàng theo ShopID
    $ordersQuery = OrderSeller::where('ShopID', $shopId);


    // Lọc theo trạng thái (Status trong bảng ordersseller)
    if ($status && $status !== 'all') {
        $ordersQuery->where('Status', $status);
    }


    // Lọc theo mã đơn hàng hoặc tên khách hàng (dùng quan hệ với OrderBuyer)
    if ($searchTerm) {
    $ordersQuery->where(function ($q) use ($searchTerm) {
        // Lọc theo orderseller
        $q->where('SellerOrderCode', 'like', '%' . $searchTerm . '%')
          ->orWhere('Status', 'like', '%' . $searchTerm . '%');


        // Lọc thêm trong orderBuyer
        $q->orWhereHas('orderBuyer', function ($sub) use ($searchTerm) {
            $sub->where('OrderCode', 'like', '%' . $searchTerm . '%')
                ->orWhere('ShippingFullName', 'like', '%' . $searchTerm . '%');
        });
    });
}


    $orders = $ordersQuery
        ->with([
            'orderItems' => function ($q) use ($shopId) {
                $q->whereHas('variant', function ($q2) use ($shopId) {
                    $q2->whereHas('product', function ($q3) use ($shopId) {
                        $q3->where('ShopID', $shopId);
                    });
                })
                ->with(['variant.product' => function ($q4) {
                    $q4->select('ProductID', 'Name', 'ShopID');
                }]);
            },
            'orderBuyer' => function ($q) {
                $q->select('OrderID', 'OrderCode', 'ShippingFullName', 'OrderDate');
            }
        ])
        ->select(
            'SellerOrderID',
            'SellerOrderCode',
            'OrderID',
            'ShopID',
            'Status',
            'SubtotalAmount',
            'ShippingFee',
            'ShopVoucherDiscount',
            'TotalAmount',
            'TrackingCode',
            'ShippingCarrier',
            'ShippedAt',
            'DeliveredAt',
            'CreatedAt'
        )
        ->orderBy('CreatedAt', 'desc')
        ->paginate(15);


    // Tính subtotal theo shop (SubtotalAmount đã có trong bảng,
    // nhưng nếu muốn tính lại từ orderItems thì vẫn giữ như sau)
    $orders->getCollection()->transform(function ($order) {
        $shopSubtotal = $order->orderItems->sum('Subtotal');
        $order->shop_subtotal = $shopSubtotal;
        $order->ShippingFullName = $order->orderBuyer->ShippingFullName ?? null;
        return $order;
    });




    return response()->json($orders);
}




 public function show($SellerOrderID)
{
    $shop = Shop::where('UserID', Auth::id())->firstOrFail();
    if (!$shop) {
        return response()->json(['message' => 'Bạn không sở hữu cửa hàng nào.'], 403);
    }


    $shopId = $shop->ShopID;


    $order = OrderSeller::where('SellerOrderID', $SellerOrderID)
        ->whereHas('orderItems.variant.product', function ($query) use ($shopId) {
            $query->where('ShopID', $shopId);
        })
        ->with([
            'orderBuyer.user:UserID,FullName,Email',
            'orderBuyer.address',
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
        'sellerOrderId'       => $order->SellerOrderID,
        'orderCode'           => $order->SellerOrderCode,
        'orderDate'           => $order->orderBuyer->OrderDate,
        'overallStatus'       => $order->Status,
        'shippingFullName'    => $order->orderBuyer->ShippingFullName,
        'shippingFee'         => $order->ShippingFee,
        'ShopVoucherDiscount' => $order->ShopVoucherDiscount,
        'shippingPhoneNumber' => $order->orderBuyer->ShippingPhoneNumber,
        'notes'               => $order->orderBuyer->Notes,
        'totalAmount'         => $order->TotalAmount,
        'shopSubtotal'        => $order->orderItems->sum('Subtotal'),
        'paymentMethod'       => $order->orderBuyer->PaymentMethod,
        'paymentStatus'       => $order->PaymentStatus,
        'user' => $order->orderBuyer->user ? [
            'fullname' => $order->orderBuyer->user->FullName,
            'email'    => $order->orderBuyer->user->Email,
        ] : null,
        'address' => $order->orderBuyer->address ? [
            'street'   => $order->orderBuyer->address->Street,
            'ward'     => $order->orderBuyer->address->Ward,
            'district' => $order->orderBuyer->address->District,
            'city'     => $order->orderBuyer->address->City,
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
        'proof_image1'   => $order->proof_image1,
        'proof_image2'   => $order->proof_image2,
        'reason'         => $order->reason,
        'DeliveredAt'=> $order->DeliveredAt,
        'delivery_date'  => $order->orderBuyer->delivery_date,
    ];


    return response()->json($transformedData);
}






    public function confirmOrder($orderId)
    {
        $order = OrderSeller::find($orderId);
        if (!$order) {
            return response()->json(['message' => 'Đơn hàng không tồn tại.'], 404);
        }
        if ($order->Status !== 'Pending') {
            return response()->json(['message' => 'Chỉ có thể xác nhận đơn hàng ở trạng thái Pending.'], 400);
        }
        $order->Status = 'Processing';
        $order->save();


        return response()->json(['message' => 'Đơn hàng đã được xác nhận và đang chuẩn bị.', 'order' => $order], 200);
    }


    public function cancelOrder($orderId)
{
    $order = OrderSeller::find($orderId);
    if (!$order) {
        return response()->json(['message' => 'Đơn hàng không tồn tại.'], 404);
    }
    if (!in_array($order->Status, ['Pending', 'Processing'])) {
        return response()->json(['message' => 'Chỉ có thể hủy đơn hàng ở trạng thái Pending hoặc Processing.'], 400);
    }
    $order->Status = 'CancelledBySeller';
    $order->save();


    return response()->json(['message' => 'Đơn hàng đã được hủy.', 'order' => $order], 200);
}


  public function printShippingLabel($orderId)
{
    $user = Auth::user();
    $shop = $user->shop;


    if (!$shop) {
        return response()->json(['message' => 'Bạn không sở hữu cửa hàng nào.'], 403);
    }


    $shopId = $shop->ShopID;


    // Tìm đơn hàng con (OrderSeller) thuộc shop này
    $order = OrderSeller::where('SellerOrderID', $orderId)
        ->where('ShopID', $shopId)
        ->with([
            'orderBuyer.user:UserID,Username,Email',
            'orderBuyer.address',
            'orderItems' => function ($query) {
                $query->with([
                    'variant:VariantID,SKU,ImageURL,ProductID',
                    'variant.product:ProductID,Name'
                ]);
            }
        ])
        ->firstOrFail();
     Log::info('PDF Generation Error for SellerOrder ' .$order);
    if (!$order) {
        return response()->json(['message' => 'Đơn hàng không tồn tại.'], 404);
    }


    try {
        $pdf = Pdf::loadView('pdf.shipping_label', ['order' => $order ,'orderBuyer' => $order->orderBuyer]);
        $pdf->setOptions(['defaultFont' => 'DejaVu Sans']);


        return response($pdf->output(), 200)
            ->header('Content-Type', 'application/pdf')
            ->header(
                'Content-Disposition',
                'attachment; filename="shipping_label_' . $orderId . '.pdf"'
            );
    } catch (\Exception $e) {
        Log::error('PDF Generation Error for SellerOrder ' . $orderId . ': ' . $e->getMessage());


        return response()->json([
            'message' => 'Lỗi tạo PDF: ' . $e->getMessage()
        ], 500);
    }
}






public function handle(Request $request)
{
    Log::info('>>>>>>> Received webhook from Shipping Manager:', $request->all());


    $status   = $request->input('status');
    $order_code = $request->input('orderId');
    $deliver_date = $request->input('deliver_date');
   
    // Base rules áp dụng cho tất cả status
    $baseRules = [
        'orderId' => 'required|string',
        'status'   => 'required|string',
    ];


    // Custom rules tùy theo status
    $customRules = [];


    if ($status === 'Delivered') {
        $customRules = [
            'proof_image1' => 'required|string',
            'proof_image2' => 'required|string',
        ];
    } elseif (in_array($status, ['Failed', 'CancelledByBuyer'])) {
        $customRules = [
            'reason' => 'required|string',
        ];
    }
   
    // Validate dữ liệu
    $validated = $request->validate(array_merge($baseRules, $customRules));


    // Lấy order
     $order = OrderSeller::where('SellerOrderCode', $order_code)->first();
    if (!$order) {
        return response()->json(['message' => 'Order not found'], 404);
    }


    // Cập nhật dữ liệu
      $updateData = [
        'Status'        => $status,
        'proof_image1'  => $validated['proof_image1'] ?? null,
        'proof_image2'  => $validated['proof_image2'] ?? null,
        'reason'        => $validated['reason'] ?? null,
    ];


    // Chỉ set DeliveredAt khi status là Delivered
    if ($status === 'Delivered') {
        $updateData['DeliveredAt'] = $deliver_date ?? now();
        if($order->orderBuyer->PaymentMethod === 'COD'){
            $updateData['PaymentStatus'] = 'Paid' ;
            $updateData['paidAt']  = $deliver_date ?? now();
        }
    }


    $order->update($updateData);
    Log::info("✅ Order {$order_code} updated to status {$status}");


    return response()->json(['message' => 'Order updated successfully'], 200);
}
 public function shipOrder($orderId)
    {
        $order = OrderSeller::find($orderId);
        if (!$order) {
            return response()->json(['message' => 'Đơn hàng không tồn tại.'], 404);
        }
        if ($order->Status !== 'Processing') {
            return response()->json(['message' => 'Chỉ có thể xác nhận đã gửi khi đơn hàng đang chuẩn bị.'], 400);
        }


        $order->Status = 'Shipped';
        $order->save();


        // Lấy thông tin seller và địa chỉ giao hàng
        $shop = Shop::where('UserID', Auth::id())->firstOrFail();
        $seller = $shop->ShopName ?? 'Unknown Seller';
        $sellerPhone = $shop->ShopPhone ?? 'Unknown Phone';
        $shippingAddress = $order->orderBuyer->address ? implode(', ', array_filter([
            $order->address->Street,
            $order->address->Ward,
            $order->address->District,
            $order->address->City,
        ])) : 'Unknown Address';


        // Chuẩn bị payload cho webhook
        $payload = [
            'order_code' => $order->SellerOrderCode,
            'seller' => $seller,
            'seller_phone' => $sellerPhone,
            'shipping_address' => $shippingAddress,
        ];
         Log::info('>>>>>>> Received webhook from Shipping Manager:', $payload);
        // Gửi webhook sang app giao hàng
        $this->webhookService->sendWebhook($payload);


        return response()->json(['message' => 'Đơn hàng đã được xác nhận là đã gửi.', 'order' => $order], 200);
    }
}
