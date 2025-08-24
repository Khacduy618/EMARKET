<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Traits\ManagesOrderProcessing;
use App\Traits\ManagesVoucherUsage;

class OrderController extends Controller

{
    use ManagesOrderProcessing;
     use ManagesVoucherUsage;

     /**
     * LẤY DANH SÁCH ĐƠN HÀNG CỦA NGƯỜI DÙNG - HIỂN THỊ THEO TỪNG GÓI HÀNG (SELLER ORDER)
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthenticated.'], 401);

        // 1. Lấy tất cả các đơn hàng CON (ordersseller) của người dùng này
        // Join thêm ordersbuyer để lấy các thông tin chung của giao dịch
        $sellerOrders = DB::table('ordersseller as os')
            ->join('ordersbuyer as ob', 'os.OrderID', '=', 'ob.OrderID')
            ->join('shops as s', 'os.ShopID', '=', 's.ShopID')
            ->where('ob.UserID', $user->UserID)
            ->select(
                // Thông tin từ ordersseller
                'os.SellerOrderID', 'os.SellerOrderCode', 'os.Status', 'os.TotalAmount',
                'os.SubtotalAmount', 'os.ShippingFee', 'os.ShopVoucherDiscount',
                'os.CreatedAt', 'os.UpdatedAt',
                'os.Notes',
                'os.DeliveredAt',
                // Thông tin từ ordersbuyer (đơn hàng tổng)
                'ob.OrderID', 'ob.OrderCode', 'ob.PaymentMethod', 'os.PaymentStatus', 'ob.OrderDate',
                'ob.PlatformVoucherCode', 'ob.PlatformDiscountAmount', 'ob.shopvoucher',
                'ob.ShippingAddressID', 
                // Thông tin từ shop
                's.ShopID', 's.ShopName', 's.Level as shopLevel'
            )
            ->orderBy('os.CreatedAt', 'desc')
            ->get();

        if ($sellerOrders->isEmpty()) {
            return response()->json([]);
        }

        $sellerOrderIds = $sellerOrders->pluck('SellerOrderID');

        // 2. Lấy tất cả items của các đơn hàng con này
        $allItems = DB::table('orderitems as oi')
            ->join('productvariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
            ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
            ->leftJoin('productimages as pi', fn($join) => $join->on('p.ProductID', '=', 'pi.ProductID')->where('pi.IsPrimary', 1))
            ->whereIn('oi.SellerOrderID', $sellerOrderIds)
            ->select(
                'oi.OrderItemID', 'oi.SellerOrderID', 'oi.VariantID', 'oi.Quantity', 'oi.PriceAtPurchase', 'oi.Subtotal', 'oi.ReturnStatus',
                'p.ProductID', 'p.Name as productName',
                DB::raw('COALESCE(pv.ImageURL, pi.ImageURL, "/images/placeholder.png") as productImageURL'),
                DB::raw('COALESCE(pv.CompareAtPrice, oi.PriceAtPurchase) as OriginalPrice')
            )
            ->get();
            
        // 3. Lấy tất cả thuộc tính
        $allVariantIds = $allItems->pluck('VariantID')->unique();
        $allAttributes = DB::table('productvariantattribute as pva')
            ->join('attributevalues as av', 'pva.AttributeValueID', '=', 'av.AttributeValueID')
            ->whereIn('pva.VariantID', $allVariantIds)
            ->select('pva.VariantID', 'av.Value')
            ->get()->groupBy('VariantID');
            
        // Gắn classification vào từng item
        foreach ($allItems as $item) {
            $itemAttributes = $allAttributes->get($item->VariantID, collect());
            $item->classification = $itemAttributes->pluck('Value')->implode(', ');
        }
        
        $allItemsGroupedBySellerOrder = $allItems->groupBy('SellerOrderID');

        // 4. Ghép items vào từng đơn hàng con
        $finalSellerOrders = $sellerOrders->map(function ($sellerOrder) use ($allItemsGroupedBySellerOrder, $user) {
            $items = $allItemsGroupedBySellerOrder->get($sellerOrder->SellerOrderID, collect());
            
            // Xác định xem item có thể review không
            foreach($items as $item) {
                $isReview = false;
                if (in_array($sellerOrder->Status, ['Delivered']) &&  in_array($sellerOrder->PaymentStatus, ['Paid']) && $sellerOrder->DeliveredAt && Carbon::parse($sellerOrder->DeliveredAt)->addDays(3)->isFuture()) {
                $isReview = true;
            }
                $item->canReview = $isReview;
            }
            
            $sellerOrder->items = $items;
            $sellerOrder->isFavoriteShop = DB::table('shopfollows')->where('UserID', $user->UserID)->where('ShopID', $sellerOrder->ShopID)->exists();
            
            // Giữ tên 'Status' để logic lọc ở frontend đơn giản
            // Đồng thời tạo 'OverallStatus' để khớp với type Order của frontend (nếu cần)
            $sellerOrder->OverallStatus = $sellerOrder->Status; 
            
            // Thêm mock data
            $sellerOrder->orderStatusHistory = $this->getMockOrderStatusHistory($sellerOrder->Status, $sellerOrder->OrderDate);
            // ** LOGIC QUAN TRỌNG: Tính toán điều kiện trả hàng **
            $isEligible = false;
            // Điều kiện: Trạng thái phải là "Đã giao" hoặc "Hoàn thành" VÀ
            // ngày giao hàng phải tồn tại VÀ
            // ngày giao hàng cộng 3 ngày phải ở trong tương lai (tức là chưa hết hạn).
            if (in_array($sellerOrder->Status, ['Delivered']) &&  in_array($sellerOrder->PaymentStatus, ['Paid']) && $sellerOrder->DeliveredAt && Carbon::parse($sellerOrder->DeliveredAt)->addDays(3)->isFuture()) {
                $isEligible = true;
            }
            $sellerOrder->is_return_eligible = $isEligible;
            
            // Đổi tên key `DeliveredAt` thành `deliveredAt` (camelCase) cho nhất quán với frontend
            $sellerOrder->deliveredAt = $sellerOrder->DeliveredAt;
            unset($sellerOrder->DeliveredAt); // Xóa key cũ để tránh dư thừa

            return $sellerOrder;
        });

        return response()->json($finalSellerOrders);
    }


    /**
     * Hiển thị thông tin chi tiết của một đơn hàng.
     * Hàm này có thể trả về 2 cấu trúc dữ liệu khác nhau dựa vào tham số 'context'.
     * - context=checkout: Trả về cấu trúc CheckoutData.
     * - Mặc định: Trả về cấu trúc Order cho trang chi tiết.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $orderId
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request, $orderId)
    {
        // Lấy tham số 'context' từ URL
        $context = $request->query('context');

        // Nếu context là 'checkout', gọi hàm xử lý riêng
        if ($context == 'checkout') {
            return $this->showForCheckout($request, $orderId);
        }
    }
   
/**
     * LẤY CHI TIẾT CỦA MỘT GÓI HÀNG (SELLER ORDER) CỤ THỂ
     *
     * @param \Illuminate\Http\Request $request
     * @param int $sellerOrderId
     * @return \Illuminate\Http\JsonResponse
     */
        public function showSellerOrder(Request $request, $sellerOrderId)
        {
            $user = $request->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            $sellerOrder = DB::table('ordersseller as os')
                ->join('ordersbuyer as ob', 'os.OrderID', '=', 'ob.OrderID')
                ->join('shops as s', 'os.ShopID', '=', 's.ShopID')
                ->join('addresses as addr', 'ob.ShippingAddressID', '=', 'addr.AddressID')
                ->where('os.SellerOrderID', $sellerOrderId)
                ->where('ob.UserID', $user->UserID)
                ->select(
                    'os.*',
                    'ob.OrderCode', 'ob.PaymentMethod', 'os.PaymentStatus', 'ob.OrderDate',
                    'ob.PlatformVoucherCode', 'ob.PlatformDiscountAmount', 'ob.shopvoucher',
                    'ob.ShippingFee as TotalShippingFee', // Lấy tổng phí ship của cả đơn
                    's.ShopName', 's.Level as shopLevel',
                    'addr.Street', 'addr.Ward', 'addr.District', 'addr.City', 
                    'ob.ShippingFullName', 'ob.ShippingPhoneNumber'
                )
                ->first();

            if (!$sellerOrder) {
                return response()->json(['message' => 'Gói hàng không tồn tại hoặc bạn không có quyền truy cập.'], 404);
            }

            // === BƯỚC MỚI: TÍNH TOÁN PHÂN BỔ VOUCHER TOÀN SÀN ===
            
            // 1. Lấy TẤT CẢ các gói hàng con để tính tổng
            $allSellerOrdersInOrder = DB::table('ordersseller')
                                        ->where('OrderID', $sellerOrder->OrderID)
                                        ->get();
            
            $totalSubtotalOfAll = $allSellerOrdersInOrder->sum('SubtotalAmount');
            $totalShippingFeeOfAll = $allSellerOrdersInOrder->sum('ShippingFee');

            // 2. Lấy tổng giảm giá từ voucher toàn sàn
            $platformDiscounts = json_decode($sellerOrder->PlatformDiscountAmount, true) ?: ['saleOff' => 0, 'freeShip' => 0];
            $totalPlatformSaleOffDiscount = $platformDiscounts['saleOff'] ?? 0;
            $totalPlatformFreeshipDiscount = $platformDiscounts['freeShip'] ?? 0;
            
            // 3. Khởi tạo giá trị phân bổ
            $allocatedPlatformSaleOff = 0;
            $allocatedPlatformFreeship = 0;

            // 4. Phân bổ giảm giá SaleOff
            if ($totalSubtotalOfAll > 0 && $totalPlatformSaleOffDiscount > 0) {
                $ratio = $sellerOrder->SubtotalAmount / $totalSubtotalOfAll;
                $allocatedPlatformSaleOff = floor($totalPlatformSaleOffDiscount * $ratio);
            }
            
            // 5. Phân bổ giảm giá Freeship
            if ($totalShippingFeeOfAll > 0 && $totalPlatformFreeshipDiscount > 0) {
                $ratio = $sellerOrder->ShippingFee / $totalShippingFeeOfAll;
                $allocatedPlatformFreeship = floor($totalPlatformFreeshipDiscount * $ratio);
            }
            
            // 6. Gán các giá trị đã phân bổ vào đối tượng trả về
            $sellerOrder->AllocatedPlatformSaleOff = $allocatedPlatformSaleOff;
            $sellerOrder->AllocatedPlatformFreeship = $allocatedPlatformFreeship;

            // === KẾT THÚC BƯỚC MỚI ===

            // Phần lấy items và attributes không thay đổi
            $items = DB::table('orderitems as oi')
                ->join('productvariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
                ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
                ->leftJoin('productimages as pi', fn($join) => $join->on('p.ProductID', '=', 'pi.ProductID')->where('pi.IsPrimary', 1))
                ->where('oi.SellerOrderID', $sellerOrderId)
                ->select('oi.*', 'p.Name as productName',
                    DB::raw('COALESCE(pv.ImageURL, pi.ImageURL, "/images/placeholder.png") as productImageURL'),
                    DB::raw('COALESCE(pv.CompareAtPrice, oi.PriceAtPurchase) as OriginalPrice')
                )->get();

            if ($items->isNotEmpty()) {
                $allVariantIds = $items->pluck('VariantID')->unique();
                $allAttributes = DB::table('productvariantattribute as pva')
                    ->join('attributevalues as av', 'pva.AttributeValueID', '=', 'av.AttributeValueID')
                    ->whereIn('pva.VariantID', $allVariantIds)
                    ->select('pva.VariantID', 'av.Value')->get()->groupBy('VariantID');
                
                foreach ($items as $item) {
                    $itemAttributes = $allAttributes->get($item->VariantID, collect());
                    $item->classification = $itemAttributes->pluck('Value')->implode(', ');
                    $item->canReview = in_array($sellerOrder->Status, ['Delivered']);
                }
            }
            
            $sellerOrder->items = $items;
            $sellerOrder->orderStatusHistory = $this->getMockOrderStatusHistory($sellerOrder->Status, $sellerOrder->OrderDate);
            $sellerOrder->shippingTracking = $this->getMockShippingTracking();

            return response()->json($sellerOrder);
        }


    
    // In app/Http/Controllers/OrderController.php

private function showForCheckout(Request $request, $orderId)
{
    $user = $request->user();
    
    // 1. Lấy thông tin đơn hàng tổng và kiểm tra quyền sở hữu
    $order = DB::table('ordersbuyer')
        ->where('OrderID', $orderId)
        ->where('UserID', $user->UserID)
        ->first();
    
    if (!$order) {
        return response()->json(['message' => 'Order not found or you do not have permission to view it.'], 404);
    }

    // 2. Lấy các thông tin liên quan
    $address = DB::table('addresses')->where('AddressID', $order->ShippingAddressID)->first();
    $sellerOrders = DB::table('ordersseller')->where('OrderID', $orderId)->get();

    if ($sellerOrders->isEmpty()) {
        return response()->json(['message' => 'This order contains no items.'], 404);
    }
    
    $sellerOrderIds = $sellerOrders->pluck('SellerOrderID');
    
    // 3. Lấy tất cả items, attributes, và vouchers trong các câu query hiệu quả
    $orderItems = DB::table('orderitems as oi')
        ->join('productvariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
        ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
        ->join('shops as s', 'p.ShopID', '=', 's.ShopID')
        ->select(
            'oi.OrderItemID', 'oi.SellerOrderID', 'oi.VariantID as variantId', 'oi.Quantity as quantity',
            'oi.PriceAtPurchase as price', 'oi.Subtotal as subtotal', 'p.ProductID as productId', 
            'p.Name as name', 'p.Discount', 'p.ShopID as shopId', 'pv.CompareAtPrice as originalPrice', 
            'pv.ImageURL as imageUrl', 's.ShopName as shopName', 's.Level as shopLevel'
        )
        ->whereIn('oi.SellerOrderID', $sellerOrderIds)
        ->get();

    $allVariantIds = $orderItems->pluck('variantId')->unique();
    $allAttributes = DB::table('productvariantattribute as pva')
        ->join('attributevalues as av', 'pva.AttributeValueID', '=', 'av.AttributeValueID')
        ->whereIn('pva.VariantID', $allVariantIds)
        ->select('pva.VariantID', 'av.Value')->get()->groupBy('VariantID');
    
    $platformVoucherCodes = json_decode($order->PlatformVoucherCode, true) ?: [];
    $shopVouchersDetails = json_decode($order->shopvoucher, true) ?: [];
    $allVoucherCodes = array_filter(array_merge(
        array_values($platformVoucherCodes),
        array_column($shopVouchersDetails, 'code')
    ));
    $vouchersInfo = DB::table('vouchers')->whereIn('Code', $allVoucherCodes)->get()->keyBy('Code');

    // 4. Xây dựng cấu trúc shopOrders cho frontend
    $itemsGroupedByShop = $orderItems->groupBy('shopId');
    $checkoutShopOrders = [];
    foreach ($itemsGroupedByShop as $shopId => $items) {
        $firstItem = $items->first();
        $sellerOrder = $sellerOrders->firstWhere('ShopID', $shopId);
        
        $checkoutItems = $items->map(function ($item) use ($allAttributes) {
            $attributes = $allAttributes->get($item->variantId, collect());
            return [
                'variantId' => $item->variantId, 'productId' => $item->productId, 'shopId' => $item->shopId,
                'name' => $item->name, 'imageUrl' => $item->imageUrl, 'classification' => $attributes->pluck('Value')->implode(', '),
                'price' => $item->price, 'originalPrice' => $item->originalPrice, 'quantity' => $item->quantity,
                'subtotal' => $item->subtotal, 'product' => ['ProductID' => $item->productId, 'Name' => $item->name, 'Discount' => $item->Discount],
            ];
        });

        $appliedVoucherInfo = null;
        $voucherDetail = collect($shopVouchersDetails)->firstWhere('shopId', $shopId);
        if ($voucherDetail) {
            $appliedVoucherInfo = $vouchersInfo->get($voucherDetail['code']);
        }

        $checkoutShopOrders[] = [
            'shopId' => $shopId, 'shopName' => $firstItem->shopName, 'shopLevel' => $firstItem->shopLevel,
            'items' => $checkoutItems->values()->all(), 'shippingMethod' => 'Nhanh', 
            'shippingFee' => $sellerOrder->ShippingFee ?? 0, 'deliveryEstimate' => '2-3 ngày', 
            'appliedVoucher' => $appliedVoucherInfo, 'messageToSeller' => $sellerOrder->Notes ?? '',
        ];
    }

    // 5. Xây dựng đối tượng summary chính xác từ database
    $platformDiscounts = json_decode($order->PlatformDiscountAmount, true) ?: ['saleOff' => 0, 'freeShip' => 0];
    $totalSaleoff = $platformDiscounts['saleOff'] ?? 0;
    $totalFreeship = $platformDiscounts['freeShip'] ?? 0;
    
    $shopDiscounts = json_decode($order->shopdiscountamount, true) ?: [];
    $totalShopVoucherDiscount = array_sum(array_values($shopDiscounts));

    $summary = [
        'totalProductsPrice' => (int) $order->SubtotalAmount,
        'totalShippingFee' => (int) $order->ShippingFee,
        'totalShopVoucherDiscount' => (int) $totalShopVoucherDiscount,
        'totalPlatformVoucherDiscount' => (int) ($totalSaleoff + $totalFreeship),
        'totalFreeship' => (int) $totalFreeship,
        'totalSaleoff' => (int) $totalSaleoff,
        'totalDiscount' => (int) $order->DiscountAmount,
        'finalTotal' => (int) $order->TotalAmount,
    ];

    // 6. Tạo payload cuối cùng để trả về
    $responsePayload = [
        'OrderID' => $order->OrderID,
        'OrderCode' => $order->OrderCode,
        'address' => $address,
        'shopOrders' => $checkoutShopOrders,
        'appliedPlatformVouchers' => [
            'saleOffVoucher' => $vouchersInfo->get($platformVoucherCodes['saleOff'] ?? null),
            'freeShipVoucher' => $vouchersInfo->get($platformVoucherCodes['freeShip'] ?? null),
        ],
        'summary' => $summary,
        'PaymentMethod' => $order->PaymentMethod,
    ];
    
    return response()->json($responsePayload);
}
    

     private function getMockOrderStatusHistory($status, $orderDate) {
        $history = [
            ['status' => 'Đơn Hàng Đã Đặt', 'isCompleted' => false, 'isActive' => false, 'date' => Carbon::parse($orderDate)->format('d-m-Y'), 'time' => Carbon::parse($orderDate)->format('H:i')],
            ['status' => 'Đã Xác Nhận Thông Tin Thanh Toán', 'isCompleted' => false, 'isActive' => false, 'date' => '', 'time' => ''],
            ['status' => 'Đã Giao Cho ĐVVC', 'isCompleted' => false, 'isActive' => false, 'date' => '', 'time' => ''],
            ['status' => 'Đã Nhận Được Hàng', 'isCompleted' => false, 'isActive' => false, 'date' => '', 'time' => ''],
            ['status' => 'Đánh Giá', 'isCompleted' => false, 'isActive' => false, 'date' => '', 'time' => ''],
        ];

        switch ($status) {
            case 'Completed': case 'Rated': $history[4]['isCompleted'] = true; $history[4]['isActive'] = true; // Fall-through
            case 'Delivered': $history[3]['isCompleted'] = true; // Fall-through
            case 'Shipped': case 'OutForDelivery': $history[2]['isCompleted'] = true; // Fall-through
            case 'Processing': $history[1]['isCompleted'] = true; // Fall-through
            case 'Pending': $history[0]['isCompleted'] = true; break;
        }
        return $history;
    }

    private function getMockShippingTracking() {
        return [['status' => 'Đã giao', 'date' => '03-06-2025', 'time' => '08:57', 'location' => 'Giao hàng thành công'], ['status' => 'Đang vận chuyển', 'date' => '03-06-2025', 'time' => '07:36', 'location' => 'Đơn hàng sẽ sớm được giao']];
    }


    /**
     * Tạo đơn hàng CHỈ DỰA VÀO CÁC ID TỪ CLIENT.
     * Toàn bộ logic tính toán được thực hiện ở Server.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */

public function placeOrder(Request $request)
{
    Log::info('--- Received request for placeOrder (FINAL LOGIC) ---', $request->all());
    
    $validator = Validator::make($request->all(), [
        'shippingAddressId'     => 'required|integer|exists:addresses,AddressID',
        'shopNotes'             => 'nullable|array', 
        'shopNotes.*'           => 'nullable|string',
        'paymentMethod'         => 'required|string|in:COD,Paypal,VNPay',
        'items'                 => 'required|array|min:1',
        'items.*.variantId'     => 'required|integer|exists:productvariants,VariantID',
        'items.*.quantity'      => 'required|integer|min:1',
        'platformVoucherCodes'  => 'nullable|array',
        'platformVoucherCodes.*'=> 'sometimes|string|exists:vouchers,Code',
        'shopVoucherCodes'      => 'nullable|array',
        'shopVoucherCodes.*'    => 'sometimes|string|exists:vouchers,Code',
        'shippingFee'           => 'required|numeric|min:0',
    ]);

    if ($validator->fails()) {
        Log::warning('placeOrder validation failed:', $validator->errors()->toArray());
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $validatedData = $validator->validated();
    $user = $request->user();

    try {
        $order = DB::transaction(function () use ($validatedData, $user) {
            
            // === STEP 1: Lấy dữ liệu gốc ===
            $variantIds = array_column($validatedData['items'], 'variantId');
            $variantsInfo = DB::table('productvariants as pv')
                ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
                ->whereIn('pv.VariantID', $variantIds)
                ->select('pv.VariantID', 'p.Discount as ProductDiscount', 'pv.Price', 'pv.CompareAtPrice', 'pv.StockQuantity', 'p.ShopID')
                ->get()->keyBy('VariantID');

            $allVoucherCodes = array_merge($validatedData['platformVoucherCodes'] ?? [], $validatedData['shopVoucherCodes'] ?? []);
            $vouchersInfo = DB::table('vouchers')->whereIn('Code', array_filter($allVoucherCodes))->get()->keyBy('Code');
            $address = DB::table('addresses')->where('AddressID', $validatedData['shippingAddressId'])->first();

            $allAppliedCodes = collect(array_filter($allVoucherCodes));
            $userVoucherUsage = DB::table('uservouchers')
                ->where('UserID', $user->UserID)
                ->whereIn('VoucherID', $vouchersInfo->pluck('VoucherID'))
                ->select('VoucherID', DB::raw('COUNT(*) as times_used'))
                ->groupBy('VoucherID')
                ->get()->keyBy('VoucherID');

            foreach ($allAppliedCodes as $code) {
                $voucher = $vouchersInfo->get($code);
                if (!$voucher) continue; // Bỏ qua nếu voucher không tồn tại

                // Kiểm tra tổng lượt sử dụng
                if ($voucher->UsageLimitTotal !== null && $voucher->TimesUsed >= $voucher->UsageLimitTotal) {
                    throw new \Exception("Rất tiếc, mã voucher '{$code}' đã hết lượt sử dụng.");
                }

                // Kiểm tra lượt sử dụng của riêng user này
                $userUsage = $userVoucherUsage->get($voucher->VoucherID);
                $timesUsedByUser = $userUsage ? $userUsage->times_used : 0;
                if ($voucher->UsageLimitPerUser !== null && $timesUsedByUser >= $voucher->UsageLimitPerUser) {
                    throw new \Exception("Bạn đã sử dụng hết số lần cho phép đối với mã voucher '{$code}'.");
                }
            }
             Log::info("Voucher validation passed for UserID: {$user->UserID}");

            // === STEP 2: Gom nhóm sản phẩm và tính Subtotal ban đầu ===
            $itemsByShop = [];
            $serverTotalSubtotal = 0;

            foreach ($validatedData['items'] as $item) {
                $variant = $variantsInfo->get($item['variantId']);
                if (!$variant || $variant->StockQuantity < $item['quantity']) throw new \Exception("Sản phẩm có ID biến thể {$item['variantId']} không đủ số lượng.");
                
                $basePrice = $variant->CompareAtPrice ?? $variant->Price;
                $priceAtPurchase = floor($basePrice * (1 - ($variant->ProductDiscount / 100)));
                $subtotal = $priceAtPurchase * $item['quantity'];
                $serverTotalSubtotal += $subtotal;
                $shopId = $variant->ShopID;
                
                if (!isset($itemsByShop[$shopId])) $itemsByShop[$shopId] = ['items' => [], 'subtotal' => 0];
                $itemsByShop[$shopId]['items'][] = ['VariantID' => $item['variantId'], 'Quantity' => $item['quantity'], 'PriceAtPurchase' => $priceAtPurchase, 'Subtotal' => $subtotal];
                $itemsByShop[$shopId]['subtotal'] += $subtotal;
            }
            
            // === STEP 3: Phân bổ phí vận chuyển ===
            $totalShippingFeeFromClient = $validatedData['shippingFee'];
            $shopCount = count($itemsByShop);
            if ($shopCount > 0) {
                $shippingFeePerShop = floor($totalShippingFeeFromClient / $shopCount);
                $firstShopId = array_key_first($itemsByShop);
                foreach ($itemsByShop as $shopId => &$shopData) $shopData['shippingFee'] = $shippingFeePerShop;
                $itemsByShop[$firstShopId]['shippingFee'] += $totalShippingFeeFromClient % $shopCount;
            }
            
            // === STEP 4: Tính toán & Phân bổ tất cả các loại giảm giá ===
            $totalShopVoucherDiscount = 0;
            $platformSaleOffDiscount = 0;
            $platformFreeshipDiscount = 0;
            $shopVouchersAppliedDetails = []; 
            $shopDiscountAmountsById = []; 
            $platformVoucherCodesApplied = ['saleOff' => null, 'freeShip' => null];

            // 4.1 Tính giảm giá của từng shop
            foreach ($itemsByShop as $shopId => &$shopData) {
                $shopSubtotal = $shopData['subtotal'];
                $appliedCode = collect($validatedData['shopVoucherCodes'])->first(fn($code) => $vouchersInfo->get($code) && $vouchersInfo->get($code)->ShopID == $shopId);
                $shopData['voucherDiscount'] = 0;
                if ($appliedCode && ($v = $vouchersInfo->get($appliedCode)) && $shopSubtotal >= $v->MinOrderValue) {
                    $discount = ($v->DiscountType === 'FixedAmount') ? $v->DiscountValue : $shopSubtotal * ($v->DiscountValue / 100);
                    if ($v->DiscountType === 'Percentage' && $v->MaxValueForPercentage) $discount = min($discount, $v->MaxValueForPercentage);
                    $shopVoucherDiscountForThisShop = floor($discount);
                    $totalShopVoucherDiscount += $shopVoucherDiscountForThisShop;
                    $shopVouchersAppliedDetails[] = ['shopId' => $shopId, 'code' => $v->Code, 'discount' => $shopVoucherDiscountForThisShop];
                    $shopDiscountAmountsById[(string)$shopId] = $shopVoucherDiscountForThisShop;
                    $shopData['voucherDiscount'] = $shopVoucherDiscountForThisShop;
                }
            }
            unset($shopData);

            // 4.2 Tính giảm giá của sàn
            foreach ($validatedData['platformVoucherCodes'] ?? [] as $code) {
                if ($v = $vouchersInfo->get($code)) {
                    if ($v->VoucherType === 'SaleOff' && $serverTotalSubtotal >= $v->MinOrderValue) {
                         $discount = ($v->DiscountType === 'FixedAmount') ? $v->DiscountValue : $serverTotalSubtotal * ($v->DiscountValue / 100);
                         if ($v->DiscountType === 'Percentage' && $v->MaxValueForPercentage) $discount = min($discount, $v->MaxValueForPercentage);
                         $platformSaleOffDiscount = floor($discount);
                         $platformVoucherCodesApplied['saleOff'] = $v->Code;
                    } elseif ($v->VoucherType === 'FreeShip' && $serverTotalSubtotal >= $v->MinOrderValue) {
                        $platformFreeshipDiscount = min($totalShippingFeeFromClient, $v->DiscountValue);
                        $platformVoucherCodesApplied['freeShip'] = $v->Code;
                    }
                }
            }
            
            // 4.3 Phân bổ giảm giá toàn sàn cho từng shop
            foreach ($itemsByShop as $shopId => &$shopData) {
                $shopData['allocatedSaleOff'] = 0;
                $shopData['allocatedFreeship'] = 0;
                if ($serverTotalSubtotal > 0 && $platformSaleOffDiscount > 0) {
                    $shopData['allocatedSaleOff'] = floor(($shopData['subtotal'] / $serverTotalSubtotal) * $platformSaleOffDiscount);
                }
                if ($totalShippingFeeFromClient > 0 && $platformFreeshipDiscount > 0) {
                    $shopData['allocatedFreeship'] = floor(($shopData['shippingFee'] / $totalShippingFeeFromClient) * $platformFreeshipDiscount);
                }
            }
            unset($shopData);

            $serverTotalDiscount = $totalShopVoucherDiscount + $platformSaleOffDiscount + $platformFreeshipDiscount;
            $serverTotalAmount = $serverTotalSubtotal + $totalShippingFeeFromClient - $serverTotalDiscount;



            // === STEP 5: Tạo các bản ghi Database ===

            $paymentMethod = $validatedData['paymentMethod'];
            $isCOD = ($paymentMethod === 'COD');

            $orderCode = 'EMK' . Carbon::now()->format('Ymd') . strtoupper(Str::random(6));

            $orderId = DB::table('ordersbuyer')->insertGetId([
                'OrderCode' => $orderCode, 'UserID' => $user->UserID,
                'TotalAmount' => $serverTotalAmount, 'SubtotalAmount' => $serverTotalSubtotal,
                'ShippingFee' => $totalShippingFeeFromClient, 'DiscountAmount' => $serverTotalDiscount,
                'ShippingAddressID' => $validatedData['shippingAddressId'], 'ShippingFullName' => $address->FullName,
                'ShippingPhoneNumber' => $address->PhoneNumber, 
                'PaymentMethod' => $paymentMethod,
                'PlatformVoucherCode' => json_encode($platformVoucherCodesApplied),
                'PlatformDiscountAmount' => json_encode(['saleOff' => $platformSaleOffDiscount, 'freeShip' => $platformFreeshipDiscount]),
                'shopvoucher' => json_encode($shopVouchersAppliedDetails),
                'shopdiscountamount' => json_encode($shopDiscountAmountsById),
                'CreatedAt' => now(), 'UpdatedAt' => now(),
            ]);

            foreach ($itemsByShop as $shopId => $shopData) {
                // TÍNH TOÁN LẠI TỔNG TIỀN CHO TỪNG SHOP SAU KHI ĐÃ PHÂN BỔ
                $shopTotalAmount = $shopData['subtotal'] 
                                 + $shopData['shippingFee'] 
                                 - $shopData['voucherDiscount'] 
                                 - $shopData['allocatedSaleOff'] 
                                 - $shopData['allocatedFreeship'];

                $sellerOrderId = DB::table('ordersseller')->insertGetId([
                    'SellerOrderCode' => $orderCode . '-' . $shopId, 'OrderID' => $orderId,
                    'ShopID' => $shopId, 'Status' => $isCOD ? 'Processing' : 'Pending', // Trạng thái gói hàng con cũng thay đổi theo, 
                    'SubtotalAmount' => $shopData['subtotal'],
                    'ShippingFee' => $shopData['shippingFee'], 'ShopVoucherDiscount' => $shopData['voucherDiscount'],
                    'TotalAmount' => $shopTotalAmount, // LƯU GIÁ TRỊ ĐÃ TÍNH TOÁN LẠI
                    'PaymentStatus' => 'Pending',
                    'Notes' => $validatedData['shopNotes'][$shopId] ?? null,
                    'TrackingCode' => 'PENDING_' . strtoupper(Str::random(8)),
                    'CreatedAt' => now(), 'UpdatedAt' => now(),
                ]);

                $itemsToInsert = collect($shopData['items'])->map(fn($item) => array_merge($item, ['SellerOrderID' => $sellerOrderId, 'CreatedAt' => now()]))->all();
                DB::table('orderitems')->insert($itemsToInsert);
            }
                if ($isCOD) {
                    Log::info("Processing COD Order immediately. OrderID: {$orderId}");
                    $fullOrderDetails = DB::table('ordersbuyer')->where('OrderID', $orderId)->first();
                    $this->processConfirmedOrder($fullOrderDetails);
                    $this->updateUserVoucherUsage($fullOrderDetails);
                }


            Log::info("placeOrder (Full Allocation): Successfully created OrderID: {$orderId}");
            return ['orderId' => $orderId, 'orderCode' => $orderCode];
        });

        return response()->json(['message' => 'Order created!', 'orderId' => $order['orderId'], 'orderCode' => $order['orderCode']], 201);

    } catch (\Exception $e) {
        Log::error('Placing order failed (Full Allocation): ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
        return response()->json(['message' => 'An error occurred.', 'error' => $e->getMessage()], 500);
    }
}


/**
 * Hoàn tất một đơn hàng đã tồn tại (sau khi thanh toán).
 * SỬA ĐỔI: Cập nhật trạng thái cho cả ordersbuyer và các ordersseller liên quan.
 *
 * @param  \Illuminate\Http\Request  $request
 * @param  int  $orderId
 * @return \Illuminate\Http\JsonResponse
 */
public function completeOrder(Request $request, $orderId)
{

    $user = $request->user();
    $validator = Validator::make($request->all(), [
        'paymentMethod'      => 'required|string|in:Paypal,COD,VNPay',
        'paymentDetails'     => 'nullable|array',
        'paymentDetails.transactionId' => 'required_if:paymentMethod,Paypal|string',
        'paymentDetails.status' => 'required_if:paymentMethod,Paypal|string',
        'paymentDetails.vnp_TxnRef'      => 'required_if:paymentMethod,VNPay|string',
        'paymentDetails.vnp_ResponseCode'=> 'required_if:paymentMethod,VNPay|string',
        'shopNotes' => 'nullable|array',
        'shopNotes.*' => 'nullable|string|max:255',
    ]);
    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }
    $validatedData = $validator->validated();

    $order = DB::table('ordersbuyer as ob')
        ->join('ordersseller as os', 'ob.OrderID', '=', 'os.OrderID')
        ->where('ob.OrderID', $orderId)
        ->where('ob.UserID', $user->UserID)
        ->where('os.PaymentStatus', 'Pending') // Kiểm tra trạng thái đơn con
        ->select('ob.*') // Chỉ lấy thông tin từ đơn tổng
        ->distinct()     // Đảm bảo chỉ trả về 1 kết quả duy nhất cho đơn tổng
        ->first();

    if (!$order) {
        return response()->json(['message' => 'Order not found or already processed.'], 404);
    }

   try {
        // === SỬA ĐỔI CHÍNH Ở ĐÂY ===
        $completedOrderDetails = DB::transaction(function () use ($validatedData, $order, $orderId) {

            // Cập nhật lời nhắn (nếu có)
            if (!empty($validatedData['shopNotes'])) {
                foreach ($validatedData['shopNotes'] as $shopId => $note) {
                    DB::table('ordersseller')
                        ->where('OrderID', $orderId)
                        ->where('ShopID', $shopId)
                        ->update(['Notes' => $note]);
                }
                Log::info("Updated notes for OrderID {$orderId}", $validatedData['shopNotes']);
            }
            
            $paymentMethod = $validatedData['paymentMethod'];
            $isPaidOnline = ($paymentMethod === 'Paypal' && ($validatedData['paymentDetails']['status'] ?? '') === 'COMPLETED')
                         || ($paymentMethod === 'VNPay' && ($validatedData['paymentDetails']['vnp_ResponseCode'] ?? '') === '00');
            $isCOD = ($paymentMethod === 'COD');

            // Chỉ xử lý nếu thanh toán online thành công hoặc là COD
            if ($isPaidOnline || $isCOD) {

                // 1. Cập nhật bảng ordersbuyer (chỉ thời gian cập nhật)
                DB::table('ordersbuyer')
                    ->where('OrderID', $orderId)
                    ->update(['UpdatedAt' => now()]);
                
                // 2. Chuẩn bị dữ liệu cập nhật cho ordersseller
                $sellerUpdates = [
                    'Status'      => 'Pending',
                    'UpdatedAt'   => now(),
                    // Mặc định PaymentStatus vẫn là Pending (cho trường hợp COD)
                    'PaymentStatus' => 'Pending' 
                ];

                // Nếu thanh toán online, cập nhật thêm trạng thái và thời gian
                if ($isPaidOnline) {
                    $sellerUpdates['PaymentStatus'] = 'Paid';
                    $sellerUpdates['paidAt'] = now();
                }

                // 3. Cập nhật bảng ordersseller
                DB::table('ordersseller')
                    ->where('OrderID', $orderId)
                    ->update($sellerUpdates);

                Log::info("Order {$orderId} status updated to Processing.");
                
                // 4. Các bước xử lý sau khi xác nhận đơn
                $fullOrderDetails = DB::table('ordersbuyer')->where('OrderID', $orderId)->first();
                $this->processConfirmedOrder($fullOrderDetails);
                $this->updateUserVoucherUsage($fullOrderDetails);
                
                // Trả về dữ liệu để biết đã thành công
                return ['orderCode' => $order->OrderCode];
            }
            
            // Nếu không rơi vào trường hợp nào, trả về null để báo lỗi
            return null; 
        });

        if (!$completedOrderDetails) {
            // Trường hợp isPaidOnline và isCOD đều false
            return response()->json(['message' => 'Payment was not successful or could not be verified.'], 400);
        }
        
        return response()->json([
            'message' => 'Order completed successfully!',
            'orderCode' => $completedOrderDetails['orderCode'],
        ]);

    } catch (\Exception $e) {
        Log::error('Order completion failed for OrderID ' . $orderId . ': ' . $e->getMessage() . ' in ' . $e->getFile() . ' on line ' . $e->getLine());
        return response()->json(['message' => 'An error occurred during order completion.', 'error' => $e->getMessage()], 500);
    }
}


/**
     * Cập nhật thông tin của một đơn hàng nháp (chủ yếu là lời nhắn).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $orderId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateDraft(Request $request, $orderId)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'shopNotes' => 'nullable|array',
            'shopNotes.*' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Tìm đơn hàng nháp thuộc sở hữu của user
        $order = DB::table('ordersbuyer')
            ->where('OrderID', $orderId)
            ->where('UserID', $user->UserID)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Đơn hàng không tồn tại hoặc không thể cập nhật.'], 404);
        }

        $shopNotes = $request->input('shopNotes', []);

        if (!empty($shopNotes)) {
            DB::transaction(function () use ($orderId, $shopNotes) {
                foreach ($shopNotes as $shopId => $note) {
                    DB::table('ordersseller')
                        ->where('OrderID', $orderId)
                        ->where('ShopID', $shopId)
                        ->update(['Notes' => $note]);
                }
            });
            Log::info("Updated notes for draft OrderID {$orderId}", $shopNotes);
        }

        return response()->json(['message' => 'Ghi chú đơn hàng đã được cập nhật.']);
    }



    /**
     * Hủy một đơn hàng nháp để người dùng có thể tạo lại.
     */
    public function cancelDraft(Request $request, $orderId)
    {
        $user = $request->user();

        try {
            DB::transaction(function () use ($orderId, $user) {
                // Tìm đơn hàng nháp thuộc sở hữu của user
                $order = DB::table('ordersbuyer')
                    ->where('OrderID', $orderId)
                    ->where('UserID', $user->UserID)
                    ->first();

                // Nếu không tìm thấy đơn hàng hoặc đơn đã được xử lý, không làm gì cả
                if (!$order) {
                    return;
                }
                // Lấy SellerOrderID từ đơn hàng chính
                $SellerOrderID = DB::table('ordersseller')
                    ->where('OrderID', $orderId)
                    ->value('SellerOrderID');

                // Lấy lại các items đã đặt để khôi phục tồn kho
                $orderItems = DB::table('orderitems')->where('SellerOrderID', $SellerOrderID)->get();

                // 1. Khôi phục số lượng tồn kho (dùng increment)
                foreach ($orderItems as $item) {
                    DB::table('productvariants')
                        ->where('VariantID', $item->VariantID)
                        ->increment('StockQuantity', $item->Quantity);
                }

                // 2. Xóa các order items liên quan
                // Thao tác này sẽ tự động được thực hiện nếu bạn đã thiết lập
                // 'ON DELETE CASCADE' ở khóa ngoại trong CSDL.
                // Nhưng để chắc chắn, chúng ta vẫn có thể xóa tường minh.
                DB::table('orderitems')->where('OrderID', $orderId)->delete();

                // 3. Xóa đơn hàng chính
                DB::table('ordersbuyer')->where('OrderID', $orderId)->delete();

                // Lưu ý: Logic khôi phục giỏ hàng ở đây có thể không cần thiết,
                // vì luồng tốt nhất là hướng người dùng về trang giỏ hàng để họ bắt đầu lại.
            });

            return response()->json(['message' => 'Draft order has been cancelled successfully.']);

        } catch (\Exception $e) {
            Log::error('Draft order cancellation failed for OrderID ' . $orderId . ': ' . $e->getMessage());
            return response()->json(['message' => 'An error occurred while cancelling the draft order.'], 500);
        }
    }

    /**
     * TÍCH HỢP CHỨC NĂNG "MUA NGAY"
     * Tạo dữ liệu thanh toán tạm thời cho một sản phẩm và trả về cấu trúc
     * để frontend lưu vào localStorage và chuyển đến trang checkout.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function buyNow(Request $request)
    {
        $validated = $request->validate([
            'variant_id' => 'required|integer|exists:productvariants,VariantID',
            'quantity' => 'required|integer|min:1',
        ]);

        $user = $request->user();
        $variantId = $validated['variant_id'];
        $quantity = $validated['quantity'];

        try {
            // Lấy thông tin chi tiết của variant, product, shop
            $itemData = DB::table('productvariants as pv')
                ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
                ->join('shops as s', 'p.ShopID', '=', 's.ShopID')
                ->where('pv.VariantID', $variantId)
                ->select(
                    'pv.VariantID', 'pv.Price', 'pv.CompareAtPrice', 'pv.StockQuantity', 'pv.ImageURL as VariantImageURL', 'pv.IsActive',
                    'p.ProductID', 'p.Name as ProductName', 'p.Description as ProductDescription', 'p.Discount as ProductDiscount', 'p.AdminApprovalStatus',
                    's.ShopID', 's.ShopName', 's.ShopPhone', 's.Level as ShopLevel'
                )->first();

            if (!$itemData || !$itemData->IsActive || $itemData->AdminApprovalStatus !== 'Approved') {
                return response()->json(['message' => 'Sản phẩm không hợp lệ hoặc không còn kinh doanh.'], 404);
            }

            if ($quantity > $itemData->StockQuantity) {
                return response()->json([
                    'message' => 'Số lượng yêu cầu vượt quá số lượng sản phẩm có sẵn trong kho.',
                    'available_stock' => $itemData->StockQuantity
                ], 400);
            }

            // Lấy thông tin attributes của variant
            $attributes = DB::table('productvariantattribute as pva')
                ->join('attributevalues as av', 'pva.AttributeValueID', '=', 'av.AttributeValueID')
                ->where('pva.VariantID', $variantId)
                ->select('av.Value')
                ->get();
            
            // Tạo một "mock CartItem" để frontend có thể tái sử dụng logic
            // Cấu trúc này phải khớp với cấu trúc mà hàm CartController@index trả về
            $mockCartItem = [
                'CartItemID' => 'buynow-'.$variantId,
                'VariantID' => $variantId,
                'ShopID' => $itemData->ShopID,
                'Quantity' => $quantity,
                'productVariant' => [
                    'VariantID' => $variantId,
                    'ProductID' => $itemData->ProductID,
                    'Price' => $itemData->Price,
                    'CompareAtPrice' => $itemData->CompareAtPrice,
                    'StockQuantity' => $itemData->StockQuantity,
                    'ImageURL' => $itemData->VariantImageURL,
                    'product' => [
                        'ProductID' => $itemData->ProductID,
                        'Name' => $itemData->ProductName,
                        'Description' => $itemData->ProductDescription,
                        'Discount' => $itemData->ProductDiscount,
                    ],
                    'attributeValues' => $attributes->map(fn($attr) => ['Value' => $attr->Value])->toArray()
                ],
                'shop' => [
                    'ShopID' => $itemData->ShopID,
                    'ShopName' => $itemData->ShopName,
                    'ShopPhone' => $itemData->ShopPhone,
                    'Level' => $itemData->ShopLevel,
                ]
            ];
            
            // Tính toán giá cuối cùng và giá gốc
            $price = (float)$mockCartItem['productVariant']['Price'];
            $originalPrice = $mockCartItem['productVariant']['CompareAtPrice'] ? (float)$mockCartItem['productVariant']['CompareAtPrice'] : null;
            $discountPercent = (float)$mockCartItem['productVariant']['product']['Discount'];
            
            // Áp dụng % discount từ sản phẩm
            if ($discountPercent > 0) {
                 // Nếu chưa có giá gốc, thì giá bán hiện tại chính là giá gốc
                if (!$originalPrice) {
                    $originalPrice = $price;
                }
                // Giảm giá trên giá bán
                $price = $price * (1 - $discountPercent / 100);
            }
            
            $subtotal = round($price * $quantity);
            $totalDiscount = $originalPrice ? round(($originalPrice - $price) * $quantity) : 0;
            
            // Tạo cấu trúc StoredCheckoutData để trả về cho frontend
            $checkoutDataForStorage = [
                'selectedItems' => [$mockCartItem],
                'appliedShopVouchers' => (object)[], // Dùng object rỗng cho nhất quán
                'appliedPlatformVouchers' => [
                    'freeShipVoucher' => null,
                    'saleOffVoucher' => null,
                ],
                'summary' => [
                    'totalSubtotal' => $subtotal,
                    'totalShopVoucherDiscount' => 0,
                    'totalPlatformVoucherDiscount' => 0,
                    'totalFreeship' => 0,
                    'totalSaleoff' => 0,
                    'totalDiscount' => $totalDiscount,
                    'finalTotal' => $subtotal, // Phí ship sẽ được tính ở frontend
                ],
                'orderId' => null, // Chưa có orderId ở bước này
            ];
            
            return response()->json($checkoutDataForStorage);

        } catch (\Exception $e) {
            Log::error('Buy Now Error: ' . $e->getMessage());
            return response()->json(['message' => 'Đã có lỗi xảy ra, vui lòng thử lại.'], 500);
        }
    }
}
