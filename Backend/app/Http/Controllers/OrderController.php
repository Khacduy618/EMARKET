<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller

{

    /**
     * Lấy danh sách tất cả đơn hàng của người dùng hiện tại (ĐÃ TỐI ƯU HÓA).
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    // public function index(Request $request)
    // {
    //     $user = $request->user();

    //     if (!$user) {
    //         return response()->json(['message' => 'Unauthenticated.'], 401);
    //     }

    //     // 1. Lấy tất cả các OrderID của người dùng.
    //     $orderIds = DB::table('ordersbuyer')
    //         ->where('UserID', $user->UserID)
    //         ->pluck('OrderID');

    //     if ($orderIds->isEmpty()) {
    //         return response()->json([]);
    //     }

    //     // 2. Lấy toàn bộ thông tin đơn hàng và thông tin shop trong MỘT câu query
    //     $ordersData = DB::table('ordersbuyer as ob')
    //         ->join('addresses as addr', 'ob.ShippingAddressID', '=', 'addr.AddressID')
    //         ->join('orderitems as oi_main', 'ob.OrderID', '=', 'oi_main.OrderID')
    //         ->join('productvariants as pv_main', 'oi_main.VariantID', '=', 'pv_main.VariantID')
    //         ->join('products as p_main', 'pv_main.ProductID', '=', 'p_main.ProductID')
    //         ->join('shops as s', 'p_main.ShopID', '=', 's.ShopID')
    //         ->whereIn('ob.OrderID', $orderIds)
    //         // DISTINCT để tránh lặp lại đơn hàng nếu có nhiều sản phẩm
    //         ->select(
    //             'ob.OrderID', 'ob.OrderCode', 'ob.UserID', 'ob.OrderDate', 'ob.TotalAmount',
    //             'ob.SubtotalAmount', 'ob.ShippingFee', 'ob.DiscountAmount', 'ob.ShippingAddressID',
    //             'ob.ShippingFullName', 'ob.ShippingPhoneNumber', 'ob.Notes', 'ob.PaymentMethod',
    //             'ob.PaymentStatus', 'ob.OverallStatus', 'ob.PlatformVoucherCode', 'ob.PlatformDiscountAmount',
    //             'ob.CreatedAt', 'ob.UpdatedAt',
    //             's.ShopID', 's.ShopName as shopName', 's.Level as shopLevel'
    //         )
    //         ->distinct()
    //         ->orderBy('ob.OrderDate', 'desc')
    //         ->get()
    //         ->keyBy('OrderID'); // Dùng OrderID làm key của mảng để dễ truy cập

    //     // 3. Lấy toàn bộ order items và thông tin sản phẩm liên quan trong MỘT câu query
    //     $allItems = DB::table('orderitems as oi')
    //         ->join('productvariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
    //         ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
    //         ->leftJoin('productimages as pi', function ($join) {
    //             $join->on('p.ProductID', '=', 'pi.ProductID')->where('pi.IsPrimary', '=', 1);
    //         })
    //         ->whereIn('oi.OrderID', $orderIds)
    //         ->select(
    //             'oi.OrderItemID', 'oi.OrderID', 'pv.VariantID', 'p.ProductID',
    //             'oi.Quantity', 'oi.PriceAtPurchase',
    //             DB::raw('COALESCE(pv.CompareAtPrice, oi.PriceAtPurchase) as OriginalPrice'),
    //             'oi.Subtotal', 'oi.IsFlashSaleItem', 'oi.FlashSaleDealID', 'oi.ReturnStatus', 'oi.CreatedAt',
    //             'p.Name as productName',
    //             DB::raw('COALESCE(pv.ImageURL, pi.ImageURL, "/images/placeholder.png") as productImageURL')
    //         )
    //         ->get()
    //         ->groupBy('OrderID'); // Gom nhóm các item theo OrderID

    //     // 4. Lấy toàn bộ thuộc tính của các variant trong các đơn hàng trong MỘT câu query
    //     $allVariantIds = $allItems->flatten()->pluck('VariantID')->unique();
    //     $allAttributes = DB::table('productvariantattribute as pva')
    //         ->join('attributevalues as av', 'pva.AttributeValueID', '=', 'av.AttributeValueID')
    //         ->whereIn('pva.VariantID', $allVariantIds)
    //         ->select('pva.VariantID', 'av.Value')
    //         ->get()
    //         ->groupBy('VariantID'); // Gom nhóm thuộc tính theo VariantID
            
    //     // 5. Lấy toàn bộ thông tin follow shop trong MỘT câu query
    //     $followedShops = DB::table('shopfollows')
    //         ->where('UserID', $user->UserID)
    //         ->whereIn('ShopID', $ordersData->pluck('ShopID')->unique())
    //         ->pluck('ShopID')
    //         ->flip(); // Dùng để kiểm tra nhanh bằng isset()

    //     // 6. Ghép tất cả dữ liệu lại bằng PHP (nhanh hơn rất nhiều so với query trong vòng lặp)
    //     $finalOrders = [];
    //     foreach ($ordersData as $orderId => $order) {
    //         $orderItems = $allItems->get($orderId, collect());

    //         if ($orderItems->isEmpty()) {
    //             Log::warning("[OrderController@index OPTIMIZED] OrderID: {$orderId} không có items. Bỏ qua.");
    //             continue;
    //         }

    //         // Gắn classification vào từng item
    //         foreach ($orderItems as $item) {
    //             $variantAttributes = $allAttributes->get($item->VariantID, collect());
    //             $item->classification = $variantAttributes->pluck('Value')->implode(', ');
    //             $item->canReview = in_array($order->OverallStatus, ['Completed', 'Delivered']);
    //         }
            
    //         $order->items = $orderItems->values()->toArray(); // Chuyển về mảng index
    //         $order->isFavoriteShop = isset($followedShops[$order->ShopID]);
            
    //         // Thêm các trường mock như cũ
    //         $order->orderStatusHistory = $this->getMockOrderStatusHistory($order->OverallStatus, $order->OrderDate);
    //         $order->shippingTracking = ($order->OverallStatus === 'Shipped' || $order->OverallStatus === 'Completed') ? $this->getMockShippingTracking() : [];
    //         $order->shippingProvider = 'Giao Hàng Nhanh';
    //         $order->trackingNumber = 'SPXVN' . rand(100000000000, 999999999999);

    //         $finalOrders[] = $order;
    //     }

    //     Log::info('[OrderController@index OPTIMIZED] Hoàn tất xử lý. Trả về ' . count($finalOrders) . ' đơn hàng.');
    //     return response()->json(array_values($finalOrders)); // Trả về mảng index
    // }

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
                // Thông tin từ ordersbuyer (đơn hàng tổng)
                'ob.OrderID', 'ob.OrderCode', 'ob.PaymentMethod', 'ob.PaymentStatus', 'ob.OrderDate',
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
                $item->canReview = in_array($sellerOrder->Status, ['Completed', 'Delivered', 'Rated']);
            }
            
            $sellerOrder->items = $items;
            $sellerOrder->isFavoriteShop = DB::table('shopfollows')->where('UserID', $user->UserID)->where('ShopID', $sellerOrder->ShopID)->exists();
            
            // Giữ tên 'Status' để logic lọc ở frontend đơn giản
            // Đồng thời tạo 'OverallStatus' để khớp với type Order của frontend (nếu cần)
            $sellerOrder->OverallStatus = $sellerOrder->Status; 
            
            // Thêm mock data
            $sellerOrder->orderStatusHistory = $this->getMockOrderStatusHistory($sellerOrder->Status, $sellerOrder->OrderDate);

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
        }else{
        // Nếu không có context, xử lý như trang chi tiết đơn hàng
        return $this->showForOrderDetail($request, $orderId);
        }

        
    }
        /**
     * Hàm private để lấy dữ liệu cho trang CHI TIẾT ĐƠN HÀNG (Order).
     * SỬA ĐỔI: Dữ liệu trả về sẽ được gom nhóm theo từng shop (shopOrders)
     * thay vì một danh sách items phẳng.
     */
    // private function showForOrderDetail(Request $request, $orderId)
    // {
    //     Log::info("--- [showForOrderDetail] Bắt đầu cho OrderID: {$orderId} ---");
    //     $user = $request->user();

    //     // 1. Lấy thông tin chính của đơn hàng
    //     $order = DB::table('ordersbuyer')
    //         ->where('OrderID', $orderId)
    //         ->where('UserID', $user->UserID)
    //         ->first();

    //     if (!$order) {
    //         Log::warning("[showForOrderDetail] Không tìm thấy OrderID: {$orderId} cho UserID: {$user->UserID}.");
    //         return response()->json(['message' => 'Order not found.'], 404);
    //     }

    //     // 2. Lấy tất cả items của đơn hàng và join với thông tin sản phẩm, shop
    //     $orderItemsWithDetails = DB::table('orderitems as oi')
    //         ->join('productvariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
    //         ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
    //         ->join('shops as s', 'p.ShopID', '=', 's.ShopID') // JOIN thêm bảng shops
    //         ->leftJoin('productimages as pi', fn($join) => $join->on('p.ProductID', '=', 'pi.ProductID')->where('pi.IsPrimary', 1))
    //         ->where('oi.OrderID', $orderId)
    //         ->select(
    //             'oi.OrderItemID', 'oi.OrderID', 'oi.VariantID', 'oi.Quantity', 
    //             'oi.PriceAtPurchase', 'oi.Subtotal', 'oi.ReturnStatus',
    //             'p.ProductID', 'p.Name as productName',
    //             DB::raw('COALESCE(pv.ImageURL, pi.ImageURL, "/images/placeholder.png") as productImageURL'),
    //             DB::raw('COALESCE(pv.CompareAtPrice, oi.PriceAtPurchase) as OriginalPrice'),
    //             // Lấy thông tin shop cho mỗi item
    //             's.ShopID', 's.ShopName as shopName', 's.Level as shopLevel'
    //         )
    //         ->get();

    //     // 3. Gom nhóm các item lại theo ShopID
    //     $shopOrdersGrouped = [];
    //     if ($orderItemsWithDetails->isNotEmpty()) {
    //         $allVariantIds = $orderItemsWithDetails->pluck('VariantID')->unique();
    //         $allAttributes = DB::table('productvariantattribute as pva')
    //             ->join('attributevalues as av', 'pva.AttributeValueID', '=', 'av.AttributeValueID')
    //             ->whereIn('pva.VariantID', $allVariantIds)
    //             ->select('pva.VariantID', 'av.Value')
    //             ->get()->groupBy('VariantID');
            
    //         foreach ($orderItemsWithDetails as $item) {
    //             // Thêm classification vào item
    //             $itemAttributes = $allAttributes->get($item->VariantID, collect());
    //             $item->classification = $itemAttributes->pluck('Value')->implode(', ');
    //             $item->canReview = in_array($order->OverallStatus, ['Completed', 'Delivered']);
                
    //             $shopId = $item->ShopID;
    //             if (!isset($shopOrdersGrouped[$shopId])) {
    //                 // Nếu shop này chưa có trong group, khởi tạo
    //                 $shopOrdersGrouped[$shopId] = [
    //                     'shopId' => $shopId,
    //                     'shopName' => $item->shopName,
    //                     'shopLevel' => $item->shopLevel,
    //                     'isFavoriteShop' => DB::table('shopfollows')->where('UserID', $user->UserID)->where('ShopID', $shopId)->exists(),
    //                     'items' => []
    //                 ];
    //             }
    //             // Thêm item vào shop tương ứng
    //             $shopOrdersGrouped[$shopId]['items'][] = $item;
    //         }
    //     }
        
    //     // 4. Tạo cấu trúc payload trả về
    //     $responsePayload = (array)$order; // Chuyển object $order thành mảng
    //     $responsePayload['shopOrders'] = array_values($shopOrdersGrouped); // Thêm mảng shopOrders đã gom nhóm
    //     // Xóa thuộc tính items phẳng không cần thiết nữa
    //     // (tạm thời giữ lại để không làm crash các component khác nếu có dùng)
    //     // unset($responsePayload['items']);
    //     $responsePayload['items'] = $orderItemsWithDetails; // Vẫn trả về items phẳng để không làm ảnh hưởng các chỗ khác

    //     // Thêm các dữ liệu mock
    //     $responsePayload['orderStatusHistory'] = $this->getMockOrderStatusHistory($order->OverallStatus, $order->OrderDate);
    //     $responsePayload['shippingTracking'] = ($order->OverallStatus === 'Shipped' || $order->OverallStatus === 'Completed') ? $this->getMockShippingTracking() : [];
    //     $responsePayload['shippingProvider'] = 'Giao Hàng Nhanh';
    //     $responsePayload['trackingNumber'] = 'SPXVN' . rand(100000000000, 999999999999);

    //     // Map các cột voucher của order vào shopOrder đầu tiên (giả định chỉ có 1 shop voucher/đơn hàng)
    //     // Đây là cách làm đơn giản, nếu 1 đơn hàng có nhiều shop thì cần logic phức tạp hơn
    //     if (!empty($responsePayload['shopOrders'])) {
    //          $responsePayload['shopOrders'][0]['appliedShopVoucherCode'] = $order->shopvoucher;
    //          $responsePayload['shopOrders'][0]['shopVoucherDiscountAmount'] = $order->shopdiscountamount;
    //     }

    //     Log::info("[showForOrderDetail] Hoàn tất và trả về dữ liệu cho Order Detail Page, OrderID: {$orderId}.");
    //     return response()->json($responsePayload);
    // }

     private function showForOrderDetail(Request $request, $orderId)
    {
        Log::info("--- [showForOrderDetail NEW LOGIC] Bắt đầu cho OrderID: {$orderId} ---");
        $user = $request->user();

        // 1. Lấy thông tin chính của đơn hàng TỔNG
        $order = DB::table('ordersbuyer as ob')
            ->join('addresses as addr', 'ob.ShippingAddressID', '=', 'addr.AddressID')
            ->where('ob.OrderID', $orderId)
            ->where('ob.UserID', $user->UserID)
            ->select('ob.*', 'addr.Street', 'addr.Ward', 'addr.District', 'addr.City')
            ->first();

        if (!$order) {
            Log::warning("[showForOrderDetail] Không tìm thấy OrderID: {$orderId} cho UserID: {$user->UserID}.");
            return response()->json(['message' => 'Order not found.'], 404);
        }

        // 2. Lấy TẤT CẢ các đơn hàng CON và thông tin shop
        $sellerOrders = DB::table('ordersseller as os')
            ->join('shops as s', 'os.ShopID', '=', 's.ShopID')
            ->where('os.OrderID', $orderId)
            ->select('os.*', 's.ShopName', 's.Level as shopLevel')
            ->get();
            
        if ($sellerOrders->isEmpty()) {
            $order->shopOrders = [];
            return response()->json($order);
        }

        // 3. Lấy TẤT CẢ các items và thuộc tính
        $sellerOrderIds = $sellerOrders->pluck('SellerOrderID');
        $allItems = DB::table('orderitems as oi')
            ->join('productvariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
            ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
            ->leftJoin('productimages as pi', fn($join) => $join->on('p.ProductID', '=', 'pi.ProductID')->where('pi.IsPrimary', 1))
            ->whereIn('oi.SellerOrderID', $sellerOrderIds)
            ->select(
                'oi.*', 'p.Name as productName', 'pv.VariantID as VariantID_alias', 'p.ProductID as ProductID_alias',
                DB::raw('COALESCE(pv.ImageURL, pi.ImageURL, "/images/placeholder.png") as productImageURL'),
                DB::raw('COALESCE(pv.CompareAtPrice, oi.PriceAtPurchase) as OriginalPrice')
            )
            ->get();
            
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
            $item->canReview = in_array($order->OverallStatus, ['Completed', 'Delivered']);
        }
        
        $allItemsGrouped = $allItems->groupBy('SellerOrderID');

        // 4. Ghép items vào từng đơn hàng con
        $order->shopOrders = $sellerOrders->map(function ($sellerOrder) use ($allItemsGrouped) {
            $sellerOrder->items = $allItemsGrouped->get($sellerOrder->SellerOrderID, collect());
            // TODO: Bạn có thể thêm logic kiểm tra follow shop ở đây nếu cần
            // $sellerOrder->isFavoriteShop = ...;
            return $sellerOrder;
        });

        // Giữ lại các mock data để frontend không bị lỗi
        $order->orderStatusHistory = $this->getMockOrderStatusHistory($order->OverallStatus, $order->OrderDate);

        Log::info("[showForOrderDetail] Hoàn tất và trả về dữ liệu cho Order Detail Page, OrderID: {$orderId}.");
        return response()->json($order);
    }
    
    /**
     * Hàm private để lấy dữ liệu cho trang CHECKOUT (CheckoutData).
     */
    private function showForCheckout(Request $request, $orderId)
    {
        $user = $request->user();

        // 1. Lấy thông tin chính của đơn hàng
        $order = DB::table('ordersbuyer')
            ->where('OrderID', $orderId)
            ->where('UserID', $user->UserID)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        // 2. Lấy thông tin địa chỉ giao hàng
        $address = DB::table('addresses')->where('AddressID', $order->ShippingAddressID)->first();

        // 3. Lấy danh sách các sản phẩm trong đơn hàng (order items)
        // $orderItems = DB::table('orderitems as oi')
        //     ->join('productvariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
        //     ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
        //     ->join('shops as s', 'p.ShopID', '=', 's.ShopID')
        //     ->select(
        //         'oi.OrderItemID',
        //         'oi.VariantID as variantId',
        //         'oi.Quantity as quantity',
        //         'oi.PriceAtPurchase as price',
        //         'oi.Subtotal as subtotal',
        //          // --- CÁC TRƯỜNG BỔ SUNG QUAN TRỌNG ---
        //         'pv.CompareAtPrice as originalPrice', // Lấy giá gốc để gạch ngang
        //         'pv.ImageURL as imageUrl',             // Lấy ảnh từ variant
        //         'p.ProductID as productId',
        //         'p.Name as name',
        //         'p.Discount',                          // Lấy % giảm giá của sản phẩm
        //         // --- Thông tin shop ---
        //         'p.ShopID as shopId',
        //         's.ShopName as shopName',
        //         's.Level as shopLevel'
        //     )
        //     ->where('oi.OrderID', $orderId)
        //     ->get();
        // 3. First, get all SellerOrderIDs associated with the main OrderID
    $sellerOrderIds = DB::table('ordersseller')
        ->where('OrderID', $orderId)
        ->pluck('SellerOrderID');

    if ($sellerOrderIds->isEmpty()) {
        // Handle case where order exists but has no seller orders (should be rare)
        $order->shopOrders = [];
        $order->summary = [
            'totalProductsPrice' => (int) $order->SubtotalAmount,
            'totalShippingFee' => (int) $order->ShippingFee,
            'totalShopVoucherDiscount' => (int) $order->shopdiscountamount,
            // ... other summary fields
        ];
        return response()->json($order);
    }
    
    // 4. Now, get all items using whereIn with SellerOrderID
    $orderItems = DB::table('orderitems as oi')
        ->join('productvariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
        ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
        ->join('shops as s', 'p.ShopID', '=', 's.ShopID')
        ->select(
            'oi.OrderItemID',
            'oi.SellerOrderID', // Include SellerOrderID to group items correctly
            'oi.VariantID as variantId',
            'oi.Quantity as quantity',
            'oi.PriceAtPurchase as price',
            'oi.Subtotal as subtotal',
            'pv.CompareAtPrice as originalPrice',
            'pv.ImageURL as imageUrl',
            'p.ProductID as productId',
            'p.Name as name',
            'p.Discount',
            'p.ShopID as shopId',
            's.ShopName as shopName',
            's.Level as shopLevel'
        )
        ->whereIn('oi.SellerOrderID', $sellerOrderIds) // <-- CORRECTED 'WHERE' CLAUSE
        ->get();


        // --- Xử lý Platform Vouchers ---
        $platformVoucherCodes = json_decode($order->PlatformVoucherCode, true) ?: [];
        $platformVouchersInfo = [];
        if (!empty($platformVoucherCodes)) {
             $platformVouchersInfo = DB::table('vouchers')->whereIn('Code', $platformVoucherCodes)->get();
        }
        
       $appliedPlatformSaleOffVoucher = null;
        $appliedPlatformFreeShipVoucher = null;

        foreach ($platformVouchersInfo as $voucher) {
            if ($voucher->VoucherType === 'SaleOff') {
                $appliedPlatformSaleOffVoucher = $voucher;
            } elseif ($voucher->VoucherType === 'FreeShip') {
                $appliedPlatformFreeShipVoucher = $voucher;
            }
        }

        // Đọc và phân tích JSON từ cột PlatformDiscountAmount
        $platformDiscounts = json_decode($order->PlatformDiscountAmount, true) ?: ['saleOff' => 0, 'freeShip' => 0];
        $platformSaleOffDiscount = $platformDiscounts['saleOff'] ?? 0;
        $platformFreeshipDiscount = $platformDiscounts['freeShip'] ?? 0;
        
        // --- Xử lý Shop Vouchers (không đổi) ---
        $appliedShopVoucherCodes = $order->shopvoucher ? explode(', ', $order->shopvoucher) : [];
        $appliedShopVouchers = DB::table('vouchers')->whereIn('Code', $appliedShopVoucherCodes)->get()->keyBy('ShopID');

        // 4. (Quan trọng) Gom nhóm các sản phẩm lại theo từng cửa hàng (shop)
        $shopOrders = [];
        foreach ($orderItems as $item) {
            // Lấy classification cho từng item
            $attributes = DB::table('productvariantattribute as pva')->join('attributevalues as av', 'pva.AttributeValueID', '=', 'av.AttributeValueID')->where('pva.VariantID', $item->variantId)->select('av.Value')->get();
            $item->classification = $attributes->pluck('Value')->implode(', ');
            $item->product = (object)['ProductID' => $item->productId, 'Name' => $item->name, 'Discount'  => $item->Discount];

            if (!isset($shopOrders[$item->shopId])) {
            // Find the corresponding seller order to get the correct shipping fee
            $sellerOrder = DB::table('ordersseller')->where('SellerOrderID', $item->SellerOrderID)->first();

            $shopOrders[$item->shopId] = [
                'shopId' => $item->shopId,
                'shopName' => $item->shopName,
                'shopLevel' => $item->shopLevel,
                'items' => [],
                'shippingMethod' => 'Nhanh',
                'shippingFee' => $sellerOrder ? $sellerOrder->ShippingFee : 30000, // Use real fee
                'deliveryEstimate' => '2-3 ngày',
                'appliedVoucher' => $appliedShopVouchers->get($item->shopId) ?? null,
                'messageToSeller' => '',
            ];
        }
        $shopOrders[$item->shopId]['items'][] = $item;
        }

        // 5. Tạo cấu trúc dữ liệu trả về giống với `checkoutData` của frontend
        $responsePayload = [
            'OrderID' => $order->OrderID,
            'OrderCode' => $order->OrderCode,
            'SubtotalAmount' => (int) $order->SubtotalAmount,
            'ShippingFee' => (int) $order->ShippingFee,
            'DiscountAmount' => (int) $order->DiscountAmount,
            'appliedPlatformVouchers' => [
                'saleOffVoucher' => $appliedPlatformSaleOffVoucher, 
                'freeShipVoucher' => $appliedPlatformFreeShipVoucher
            ],
            'TotalAmount' => (int) $order->TotalAmount,
            'PaymentMethod' => $order->PaymentMethod,
            'address' => $address,
            'shopOrders' => array_values($shopOrders), // Chuyển từ associative array sang indexed array
             'summary' => [
                'totalProductsPrice' => (int) $order->SubtotalAmount,
                'totalShippingFee' => (int) $order->ShippingFee,
                'totalShopVoucherDiscount' => (int) $order->shopdiscountamount,
                // Giá trị này từ DB là của voucher sale-off
               'totalPlatformVoucherDiscount' => (int) $platformSaleOffDiscount, // Giảm giá sale-off
                'totalFreeship' => (int) $platformFreeshipDiscount,           // Giảm giá freeship
                'totalDiscount' => (int) $order->DiscountAmount,
                'finalTotal' => (int) $order->TotalAmount,
            ]
            
        ];
        
        return response()->json($responsePayload);
    }


     // --- CÁC HÀM HELPER ĐỂ TẠO DỮ LIỆU MOCK CHO GIAO DIỆN ---
    private function getMockOrderStatusHistory($status, $orderDate) {
        // Hàm này tạo dữ liệu giả cho timeline, bạn sẽ cần thay thế bằng logic thật
        $history = [
            ['status' => 'Đơn Hàng Đã Đặt', 'isCompleted' => false, 'isActive' => false, 'date' => Carbon::parse($orderDate)->format('d-m-Y'), 'time' => Carbon::parse($orderDate)->format('H:i')],
            ['status' => 'Đã Xác Nhận Thông Tin Thanh Toán', 'isCompleted' => false, 'isActive' => false, 'date' => '', 'time' => ''],
            ['status' => 'Đã Giao Cho ĐVVC', 'isCompleted' => false, 'isActive' => false, 'date' => '', 'time' => ''],
            ['status' => 'Đã Nhận Được Hàng', 'isCompleted' => false, 'isActive' => false, 'date' => '', 'time' => ''],
            ['status' => 'Đánh Giá', 'isCompleted' => false, 'isActive' => false, 'date' => '', 'time' => ''],
        ];

        switch ($status) {
            case 'Completed':
                $history[0]['isCompleted'] = true; $history[0]['isActive'] = false;
                $history[1]['isCompleted'] = true; $history[1]['isActive'] = false;
                $history[2]['isCompleted'] = true; $history[2]['isActive'] = false;
                $history[3]['isCompleted'] = true; $history[3]['isActive'] = false;
                $history[4]['isActive'] = true;
                break;
            case 'Shipped':
                $history[0]['isCompleted'] = true; $history[0]['isActive'] = false;
                $history[1]['isCompleted'] = true; $history[1]['isActive'] = false;
                $history[2]['isCompleted'] = true; $history[2]['isActive'] = true;
                break;
            case 'Processing':
                 $history[0]['isCompleted'] = true; $history[0]['isActive'] = false;
                 $history[1]['isCompleted'] = true; $history[1]['isActive'] = true;
                break;
            case 'Pending':
            default:
                $history[0]['isActive'] = true;
                break;
        }
        return $history;
    }
    
    private function getMockShippingTracking() {
        return [
            ['status' => 'Đã giao', 'date' => '03-06-2025', 'time' => '08:57', 'location' => 'Giao hàng thành công'],
            ['status' => 'Đang vận chuyển', 'date' => '03-06-2025', 'time' => '07:36', 'location' => 'Đơn hàng sẽ sớm được giao'],
        ];
    }

    /**
     * Tạo một đơn hàng ở trạng thái "Pending" (khi người dùng nhấn Place Order).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    // public function placeOrder(Request $request)
    // {
    //     Log::info('--- Received request for placeOrder ---', $request->all());
    //     // Validation tương tự như hàm create, nhưng không cần thông tin thanh toán
    //     $validator = Validator::make($request->all(), [
    //         'shippingAddressId'     => 'required|integer|exists:addresses,AddressID',
    //         'shippingFullName'      => 'required|string|max:255',
    //         'shippingPhoneNumber'   => 'required|string|max:20',
    //         'notes'                 => 'nullable|string',
    //         'totalAmount'           => 'required|numeric|min:0',
    //         'subtotalAmount'        => 'required|numeric|min:0',
    //         'shippingFee'           => 'required|numeric|min:0',
    //         'discountAmount'        => 'required|numeric|min:0',
    //         'paymentMethod'         => 'required|string|in:COD,Paypal,VNPay', // Chỉ chấp nhận 2 loại này từ frontend
    //         // Items và cấu trúc của nó
    //         'items'                 => 'required|array|min:1',
    //         'items.*.variantId'     => 'required|integer|exists:productvariants,VariantID',
    //         'items.*.quantity'      => 'required|integer|min:1',
    //         'items.*.priceAtPurchase' => 'required|numeric|min:0', // Giá từ client để so sánh
    //         'items.*.subtotal'      => 'required|numeric|min:0',      // Subtotal từ client để so sánh

    //         // Các giá trị tổng từ client để so sánh
    //         'totalAmount'           => 'required|numeric|min:0',
    //         'subtotalAmount'        => 'required|numeric|min:0',
    //         'shippingFee'           => 'required|numeric|min:0',
    //         'discountAmount'        => 'required|numeric|min:0',

    //          'platformVoucherData'               => 'nullable|array',
    //         'platformVoucherData.codes'         => 'sometimes|array',
    //         'platformVoucherData.codes.saleOff' => 'nullable|string',
    //         'platformVoucherData.codes.freeShip'=> 'nullable|string',
    //         'platformVoucherData.discounts'     => 'sometimes|array',
    //         'platformVoucherData.discounts.saleOff' => 'nullable|numeric',
    //         'platformVoucherData.discounts.freeShip'  => 'nullable|numeric',
            
    //         'totalShopVoucherDiscount'  => 'required|numeric|min:0',
    //         'shopVouchersApplied'       => 'nullable|array',
    //         'shopVouchersApplied.*.code' => 'required_with:shopVouchersApplied|string',
    //     ]);

    //     if ($validator->fails()) {
    //          Log::warning('placeOrder validation failed:', $validator->errors()->toArray());
    //         return response()->json(['errors' => $validator->errors()], 422);
    //     }

    //     $validatedData = $validator->validated();
    //     $user = $request->user();

    //     try {
    //         // Dùng transaction để đảm bảo toàn vẹn
    //         $order = DB::transaction(function () use ($validatedData, $user) {
                
    //             // 2. LẤY DỮ LIỆU GỐC TỪ DATABASE ĐỂ TÍNH TOÁN PHÍA SERVER
    //             $variantIds = array_column($validatedData['items'], 'variantId');
    //             $variantsInfo = DB::table('productvariants as pv')
    //                 ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
    //                 ->whereIn('pv.VariantID', $variantIds)
    //                 ->select('pv.VariantID', 'p.Discount', 'pv.Price', 'pv.CompareAtPrice', 'pv.StockQuantity')
    //                 ->get()
    //                 ->keyBy('VariantID');

    //             // 3. TÍNH TOÁN VÀ XÁC THỰC LẠI Ở SERVER
    //             $serverCalculatedItems = [];
    //             $serverTotalProductDiscount = 0;
    //             $serverSubtotalAmount = 0;

    //             foreach ($validatedData['items'] as $item) {
    //                 $variant = $variantsInfo->get($item['variantId']);
    //                 if (!$variant || $variant->StockQuantity < $item['quantity']) {
    //                     throw new \Exception("Sản phẩm ID {$item['variantId']} không tồn tại hoặc không đủ số lượng.");
    //                 }

    //                 // Tính giá gốc của sản phẩm (ưu tiên CompareAtPrice)
    //                 $basePrice = $variant->CompareAtPrice ?? $variant->Price;
                    
    //                 // Tính giá cuối cùng của 1 sản phẩm (sau khi trừ discount của sản phẩm)
    //                 $priceAtPurchaseServer = floor($basePrice * (1 - ($variant->Discount ?? 0) / 100));

    //                 // Tính thành tiền của dòng item này
    //                 $subtotalServer = $priceAtPurchaseServer * $item['quantity'];

    //                 // Tính tổng số tiền được giảm giá từ chính sản phẩm (không phải voucher)
    //                 $itemProductDiscount = ($basePrice - $priceAtPurchaseServer) * $item['quantity'];
    //                 $serverTotalProductDiscount += $itemProductDiscount;

    //                 // Cộng dồn vào tổng tiền hàng (sau khi đã trừ discount sản phẩm)
    //                 $serverSubtotalAmount += $subtotalServer;

    //                 // Lưu lại thông tin đã được tính toán ở server
    //                 $serverCalculatedItems[] = [
    //                     'VariantID'       => $item['variantId'],
    //                     'Quantity'        => $item['quantity'],
    //                     'PriceAtPurchase' => $priceAtPurchaseServer,
    //                     'Subtotal'        => $subtotalServer,
    //                     'CreatedAt'       => now(),
    //                 ];
    //             }

    //             // Lấy các giá trị discount từ voucher
    //              $serverShopVoucherDiscount = $validatedData['totalShopVoucherDiscount'] ?? 0;
                
    //             // Sử dụng Null Coalescing Operator (??) để cung cấp giá trị mặc định an toàn
    //             $platformVoucherData = $validatedData['platformVoucherData'] ?? [];
    //             $platformSaleOffDiscount = $platformVoucherData['discounts']['saleOff'] ?? 0;
    //             $platformFreeshipDiscount = $platformVoucherData['discounts']['freeShip'] ?? 0;
    //             $serverPlatformVoucherDiscount = $platformSaleOffDiscount + $platformFreeshipDiscount;
    //             // TÍNH TOÁN TỔNG GIẢM GIÁ
    //             // $serverTotalDiscount = $serverTotalProductDiscount + $serverShopVoucherDiscount + $serverPlatformVoucherDiscount;

    //             // TÍNH TOÁN TỔNG TIỀN CUỐI CÙNG
    //             $shippingFee = $validatedData['shippingFee'];
    //             $serverTotalAmount = $serverSubtotalAmount + $shippingFee - $serverShopVoucherDiscount - $serverPlatformVoucherDiscount;
    //             // Lấy giá trị giảm giá từ payload
                

    //             // SO SÁNH GIÁ TRỊ TỪ CLIENT VÀ SERVER (để an toàn)
    //             // (Có thể bỏ qua nếu bạn tin tưởng client, nhưng không khuyến khích)
    //             if (abs($serverTotalAmount - $validatedData['totalAmount']) > 1) { // Cho phép sai số 1 đồng
    //                 Log::warning('TotalAmount mismatch', ['client' => $validatedData['totalAmount'], 'server' => $serverTotalAmount]);
    //                 // throw new \Exception("Tổng giá trị đơn hàng không khớp. Vui lòng thử lại.");
    //             }


    //             $orderCode = 'EMK' . Carbon::now()->format('Ymd') . strtoupper(Str::random(6));

    //             $paymentMethodEnum = $validatedData['paymentMethod'];
    //             $platformVoucherCodesJson = json_encode($platformVoucherData['codes'] ?? []);
    //             // Encode mảng voucher discounts thành chuỗi JSON
    //            $platformDiscountAmountsJson = json_encode($platformVoucherData['discounts'] ?? []);
                
    //            $shopVoucherCodes = !empty($validatedData['shopVouchersApplied']) 
    //                 ? implode(', ', array_column($validatedData['shopVouchersApplied'], 'code')) 
    //                 : null;
    //          // Dữ liệu cho bảng `ordersbuyer`
    //             $orderData = [
    //                 'OrderCode'           => $orderCode,
    //                 'UserID'              => $user->UserID,
    //                 'TotalAmount'         => $serverTotalAmount,
    //                 'SubtotalAmount'      => $serverSubtotalAmount, // Tổng tiền hàng đã trừ discount sản phẩm
    //                 'ShippingFee'         => $shippingFee,
    //                 'DiscountAmount'      => $serverTotalProductDiscount,    // Tổng tất cả các loại giảm giá
    //                 'ShippingAddressID'   => $validatedData['shippingAddressId'],
    //                 'ShippingFullName'    => $validatedData['shippingFullName'],
    //                 'ShippingPhoneNumber' => $validatedData['shippingPhoneNumber'],
    //                 'Notes'               => $validatedData['notes'],
    //                 'PaymentMethod'       => $paymentMethodEnum,
    //                 'PaymentStatus'       => 'Pending',
    //                 'OverallStatus'       => 'Pending',
    //                 // LƯU CHUỖI JSON
    //                 'PlatformVoucherCode'    => $platformVoucherCodesJson,
    //                 'PlatformDiscountAmount' => $platformDiscountAmountsJson,
                    
    //                 'shopvoucher'            => $shopVoucherCodes,
    //                 'shopdiscountamount'     => $serverShopVoucherDiscount,
    //                 'CreatedAt'              => now(),
    //                 'UpdatedAt'              => now(),
    //             ];
                
    //             Log::info('placeOrder: Creating order with server-calculated data:', $orderData);
                
    //             $orderId = DB::table('ordersbuyer')->insertGetId($orderData);

    //             // Gán OrderID cho các order items
    //             foreach ($serverCalculatedItems as &$item) {
    //                 $item['OrderID'] = $orderId;
    //             }
                
    //             DB::table('orderitems')->insert($serverCalculatedItems);
    //             Log::info("placeOrder: Successfully created OrderID: {$orderId}");

    //             return ['orderId' => $orderId, 'orderCode' => $orderCode];
    //         });

    //         return response()->json([
    //             'message'   => 'Order placed successfully in pending state!',
    //             'orderId'   => $order['orderId'],
    //             'orderCode' => $order['orderCode'],
    //         ], 201);


    //     } catch (\Exception $e) {
    //         Log::error('Placing order failed: ' . $e->getMessage());
    //         return response()->json([
    //             'message' => 'An error occurred while placing the order.',
    //             'error'   => $e->getMessage()
    //         ], 500);
    //     }
    // }


    /**
     * Tạo đơn hàng CHỈ DỰA VÀO CÁC ID TỪ CLIENT.
     * Toàn bộ logic tính toán được thực hiện ở Server.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function placeOrder(Request $request)
    {
        Log::info('--- Received request for placeOrder (ID-Based Logic) ---', $request->all());
        
        $validator = Validator::make($request->all(), [
            'shippingAddressId'     => 'required|integer|exists:addresses,AddressID',
            'notes'                 => 'nullable|string',
            'paymentMethod'         => 'required|string|in:COD,Paypal,VNPay',
            
            // Chỉ nhận danh sách ID và số lượng
            'items'                 => 'required|array|min:1',
            'items.*.variantId'     => 'required|integer|exists:productvariants,VariantID',
            'items.*.quantity'      => 'required|integer|min:1',
            
            // Chỉ nhận mã code của voucher
            'platformVoucherCode'   => 'nullable|string|exists:vouchers,Code',
            'shopVoucherCodes'      => 'nullable|array',
            'shopVoucherCodes.*'    => 'sometimes|string|exists:vouchers,Code',
        ]);

        if ($validator->fails()) {
            Log::warning('placeOrder validation failed:', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        $user = $request->user();

        try {
            $order = DB::transaction(function () use ($validatedData, $user) {
                
                // === BƯỚC 1: LẤY TOÀN BỘ DỮ LIỆU GỐC TỪ DATABASE ===
                $variantIds = array_column($validatedData['items'], 'variantId');
                $variantsInfo = DB::table('productvariants as pv')
                    ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
                    ->whereIn('pv.VariantID', $variantIds)
                    ->select('pv.VariantID', 'p.Discount', 'pv.Price', 'pv.CompareAtPrice', 'pv.StockQuantity', 'p.ShopID')
                    ->get()->keyBy('VariantID');

                $allVoucherCodes = array_merge(
                    [$validatedData['platformVoucherCode'] ?? null],
                    $validatedData['shopVoucherCodes'] ?? []
                );
                $vouchersInfo = DB::table('vouchers')->whereIn('Code', array_filter($allVoucherCodes))->get()->keyBy('Code');

                $address = DB::table('addresses')->where('AddressID', $validatedData['shippingAddressId'])->first();

                // === BƯỚC 2: TÍNH TOÁN VÀ GOM NHÓM SẢN PHẨM ===
                $itemsByShop = [];
                $serverTotalSubtotal = 0; // Tổng tiền hàng của toàn bộ đơn

                foreach ($validatedData['items'] as $item) {
                    $variant = $variantsInfo->get($item['variantId']);
                    if (!$variant || $variant->StockQuantity < $item['quantity']) {
                        throw new \Exception("Sản phẩm có ID biến thể {$item['variantId']} không đủ số lượng.");
                    }

                    $basePrice = $variant->CompareAtPrice ?? $variant->Price;
                    $priceAtPurchase = floor($basePrice * (1 - ($variant->Discount / 100)));
                    $subtotal = $priceAtPurchase * $item['quantity'];
                    $serverTotalSubtotal += $subtotal;

                    $shopId = $variant->ShopID;
                    if (!isset($itemsByShop[$shopId])) $itemsByShop[$shopId] = [];
                    $itemsByShop[$shopId][] = [
                        'VariantID'       => $item['variantId'],
                        'Quantity'        => $item['quantity'],
                        'PriceAtPurchase' => $priceAtPurchase,
                        'Subtotal'        => $subtotal,
                        'CreatedAt'       => now(),
                    ];
                }

                // === BƯỚC 3: TÍNH TOÁN GIẢM GIÁ VÀ TỔNG TIỀN ===
                $totalShopDiscount = 0;
                $platformSaleOffDiscount = 0;
                $platformFreeshipDiscount = 0;
                $shippingFee = 30000; // Tạm thời, bạn sẽ có logic tính phí ship riêng
                
                // Tính giảm giá của từng shop
                foreach ($itemsByShop as $shopId => $shopItems) {
                    $shopSubtotal = array_sum(array_column($shopItems, 'Subtotal'));
                    $appliedCode = collect($validatedData['shopVoucherCodes'])->first(function($code) use ($vouchersInfo, $shopId) {
                        $v = $vouchersInfo->get($code);
                        return $v && $v->ShopID == $shopId;
                    });
                    
                    if ($appliedCode && ($v = $vouchersInfo->get($appliedCode)) && $shopSubtotal >= $v->MinOrderValue) {
                        $discount = ($v->DiscountType === 'FixedAmount') ? $v->DiscountValue : $shopSubtotal * ($v->DiscountValue / 100);
                        if ($v->DiscountType === 'Percentage' && $v->MaxValueForPercentage) {
                            $discount = min($discount, $v->MaxValueForPercentage);
                        }
                        $totalShopDiscount += floor($discount);
                    }
                }
                
                // Tính giảm giá của sàn
                if (!empty($validatedData['platformVoucherCode']) && ($v = $vouchersInfo->get($validatedData['platformVoucherCode']))) {
                    if ($v->VoucherType === 'SaleOff' && $serverTotalSubtotal >= $v->MinOrderValue) {
                         $discount = ($v->DiscountType === 'FixedAmount') ? $v->DiscountValue : $serverTotalSubtotal * ($v->DiscountValue / 100);
                         if ($v->DiscountType === 'Percentage' && $v->MaxValueForPercentage) {
                            $discount = min($discount, $v->MaxValueForPercentage);
                         }
                         $platformSaleOffDiscount = floor($discount);
                    } elseif ($v->VoucherType === 'FreeShip' && $serverTotalSubtotal >= $v->MinOrderValue) {
                        $platformFreeshipDiscount = min($shippingFee, $v->DiscountValue);
                    }
                }
                
                $serverTotalDiscount = $totalShopDiscount + $platformSaleOffDiscount + $platformFreeshipDiscount;
                $serverTotalAmount = $serverTotalSubtotal + $shippingFee - $serverTotalDiscount;

                // === BƯỚC 4: TẠO CÁC BẢN GHI DATABASE ===
                $orderCode = 'EMK' . Carbon::now()->format('Ymd') . strtoupper(Str::random(6));

                $orderData = [
                    'OrderCode' => $orderCode,
                    'UserID' => $user->UserID,
                    'TotalAmount' => $serverTotalAmount,
                    'SubtotalAmount' => $serverTotalSubtotal,
                    'ShippingFee' => $shippingFee,
                    'DiscountAmount' => $serverTotalDiscount,
                    'ShippingAddressID' => $validatedData['shippingAddressId'],
                    'ShippingFullName' => $address->FullName,
                    'ShippingPhoneNumber' => $address->PhoneNumber,
                    'Notes' => $validatedData['notes'],
                    'PaymentMethod' => $validatedData['paymentMethod'],
                    'PaymentStatus' => 'Pending',
                    'OverallStatus' => 'Pending',
                    'PlatformVoucherCode' => json_encode(['code' => $validatedData['platformVoucherCode']]), // Lưu code đã dùng
                    'PlatformDiscountAmount' => json_encode(['saleOff' => $platformSaleOffDiscount, 'freeShip' => $platformFreeshipDiscount]),
                    'shopvoucher' => !empty($validatedData['shopVoucherCodes']) ? implode(',', $validatedData['shopVoucherCodes']) : null,
                    'shopdiscountamount' => $totalShopDiscount,
                    'CreatedAt' => now(),
                    'UpdatedAt' => now(),
                ];
                $orderId = DB::table('ordersbuyer')->insertGetId($orderData);

                foreach ($itemsByShop as $shopId => $shopItems) {
                   $shopSubtotal = array_sum(array_column($shopItems, 'Subtotal'));
                $shopVoucherDiscountForThisShop = 0; // Calculate again just for this shop
                
                $appliedCode = collect($validatedData['shopVoucherCodes'])->first(fn($code) => $vouchersInfo->get($code) && $vouchersInfo->get($code)->ShopID == $shopId);
                if($appliedCode && ($v = $vouchersInfo->get($appliedCode)) && $shopSubtotal >= $v->MinOrderValue) {
                    $discount = ($v->DiscountType === 'FixedAmount') ? $v->DiscountValue : $shopSubtotal * ($v->DiscountValue / 100);
                    if ($v->DiscountType === 'Percentage' && $v->MaxValueForPercentage) $discount = min($discount, $v->MaxValueForPercentage);
                    $shopVoucherDiscountForThisShop = floor($discount);
                }

                $shippingFeePerShop = 30000; // Assuming a fixed fee for now
                $shopTotalAmount = $shopSubtotal + $shippingFeePerShop - $shopVoucherDiscountForThisShop;

                $sellerOrderData = [
                    'SellerOrderCode' => $orderCode . '-' . $shopId,
                    'OrderID' => $orderId,
                    'ShopID' => $shopId,
                    'Status' => 'Pending',
                    'SubtotalAmount' => $shopSubtotal,
                    'ShippingFee' => $shippingFeePerShop,
                    'ShopVoucherDiscount' => $shopVoucherDiscountForThisShop,
                    'TotalAmount' => $shopTotalAmount,
                    'CreatedAt' => now(),
                    'UpdatedAt' => now(),
                ];
                     $sellerOrderId = DB::table('ordersseller')->insertGetId($sellerOrderData);;
                     foreach ($shopItems as &$item) { $item['SellerOrderID'] = $sellerOrderId; }
                     DB::table('orderitems')->insert($shopItems);
                }

                Log::info("placeOrder (ID-Based): Successfully created OrderID: {$orderId}");
                return ['orderId' => $orderId, 'orderCode' => $orderCode];
            });

            return response()->json(['message' => 'Order created!', 'orderId' => $order['orderId'], 'orderCode' => $order['orderCode']], 201);

        } catch (\Exception $e) {
            Log::error('Placing order failed (ID-Based): ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
            return response()->json(['message' => 'An error occurred.', 'error' => $e->getMessage()], 500);
        }
    }
    /**
     * Hoàn tất một đơn hàng đã tồn tại (sau khi thanh toán).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $orderId
     * @return \Illuminate\Http\JsonResponse
     */
    // public function completeOrder(Request $request, $orderId)
    // {
    //     $user = $request->user();

    //     // Validate dữ liệu thanh toán
    //     $validator = Validator::make($request->all(), [
    //         'paymentMethod'      => 'required|string|in:Paypal,COD,VNPay',
    //         'paymentDetails'     => 'nullable|array',
    //         'paymentDetails.transactionId' => 'required_if:paymentMethod,Paypal|string',
    //         'paymentDetails.status' => 'required_if:paymentMethod,Paypal|string',
    //         'paymentDetails.vnp_TxnRef'      => 'required_if:paymentMethod,VNPay|string',
    //         'paymentDetails.vnp_ResponseCode'=> 'required_if:paymentMethod,VNPay|string',
    //     ]);

    //     if ($validator->fails()) {
    //         return response()->json(['errors' => $validator->errors()], 422);
    //     }
    //     $validatedData = $validator->validated();

    //     // Tìm đơn hàng nháp
    //     $order = DB::table('ordersbuyer')
    //         ->where('OrderID', $orderId)
    //         ->where('UserID', $user->UserID)
    //         ->where('PaymentStatus', 'Pending')
    //         ->where('OverallStatus', 'Pending')
    //         ->first();

    //     if (!$order) {
    //         return response()->json(['message' => 'Order not found or already processed.'], 404);
    //     }

    //     try {
    //         // === SỬA LỖI: Gán kết quả của transaction cho một biến mới ===
    //         $completedOrderDetails = DB::transaction(function () use ($validatedData, $order, $orderId, $user) {
    //             $updates = [
    //                 'UpdatedAt' => now(),
    //             ];
    //             // Xác định trạng thái mới
    //             $paymentStatus = $order->PaymentStatus;
    //             $overallStatus = $order->OverallStatus;
    //             $paymentMethod = $validatedData['paymentMethod'];

    //             if ($paymentMethod === 'Paypal' && isset($validatedData['paymentDetails']['status']) && $validatedData['paymentDetails']['status'] === 'COMPLETED') {
    //                 $updates['PaymentStatus'] = 'Paid';
    //                 $updates['OverallStatus'] = 'Processing';
    //                 $updates['paidAt'] = now();
    //             }elseif ($paymentMethod === 'VNPay') {
    //                 // Logic này thường được gọi từ webhook để đảm bảo an toàn.
    //                 // Ở đây, chúng ta tạm giả định nếu frontend gọi completeOrder với VNPay thì là thành công.
    //                 $updates['PaymentStatus'] = 'Paid';
    //                 $updates['OverallStatus'] = 'Processing';
    //                 $updates['paidAt'] = now();
    //             } 
    //             elseif ($paymentMethod === 'COD') {
    //                 // Đối với COD, trạng thái thanh toán vẫn là 'Pending'
    //                 $updates['PaymentStatus'] = 'Pending';
    //                 $updates['OverallStatus'] = 'Processing'; // COD cũng chuyển sang Processing để shop chuẩn bị hàng
    //             }


    //             if (isset($updates['OverallStatus']) && $updates['OverallStatus'] === 'Processing') {
    //                 // 1. Cập nhật đơn hàng
    //                 DB::table('ordersbuyer')->where('OrderID', $orderId)->update($updates);
    //                 Log::info("Order {$orderId} status updated to Processing.");
                    
    //                 // Lấy lại các items trong đơn hàng để cập nhật kho và sold count
    //                 $orderItems = DB::table('orderitems')->where('OrderID', $orderId)->get();

    //                 // 2. Cập nhật tồn kho (decrement)
    //                 foreach ($orderItems as $item) {
    //                     DB::table('productvariants')
    //                         ->where('VariantID', $item->VariantID)
    //                         ->decrement('StockQuantity', $item->Quantity);
    //                 }
    //                 Log::info("Stock quantity updated for order {$orderId}.");
                    
    //                 // --- BƯỚC 3: CẬP NHẬT SOLDCOUNT CHO SẢN PHẨM ---
    //                 // Lấy danh sách ProductID duy nhất từ các order items
    //                 $productIdsToUpdate = DB::table('productvariants')
    //                     ->whereIn('VariantID', $orderItems->pluck('VariantID'))
    //                     ->distinct()
    //                     ->pluck('ProductID', 'VariantID'); // Lấy mảng [VariantID => ProductID]

    //                 // Tạo mảng để gom số lượng bán ra cho mỗi ProductID
    //                 $productSoldCount = [];
    //                 foreach ($orderItems as $item) {
    //                     $productId = $productIdsToUpdate->get($item->VariantID);
    //                     if ($productId) {
    //                         if (!isset($productSoldCount[$productId])) {
    //                             $productSoldCount[$productId] = 0;
    //                         }
    //                         $productSoldCount[$productId] += $item->Quantity;
    //                     }
    //                 }

    //                 // Cập nhật SoldCount cho từng sản phẩm trong một vòng lặp
    //                 foreach ($productSoldCount as $productId => $quantitySold) {
    //                     DB::table('products')
    //                         ->where('ProductID', $productId)
    //                         ->increment('SoldCount', $quantitySold);
    //                 }
    //                 Log::info("SoldCount updated for products in order {$orderId}.", $productSoldCount);
    //                 // --- KẾT THÚC BƯỚC 3 ---

    //                 // 4. Xóa khỏi giỏ hàng
    //                 $cart = DB::table('carts')->where('UserID', $user->UserID)->first();
    //                 if ($cart) {
    //                     $variantIdsToRemove = $orderItems->pluck('VariantID')->all();
    //                     DB::table('cartitems')
    //                         ->where('CartID', $cart->CartID)
    //                         ->whereIn('VariantID', $variantIdsToRemove)
    //                         ->delete();
    //                     Log::info("Items removed from cart for user {$user->UserID}.");
    //                 }
    //             } else {
    //                 // Trường hợp không có gì thay đổi (ví dụ: gọi API complete cho đơn COD nhiều lần)
    //                 Log::info("No status change for order {$orderId}. No further action taken.");
    //             }
    //             // === SỬA LỖI: Trả về dữ liệu cần thiết từ closure ===
    //             return [
    //                 'orderCode' => $order->OrderCode,
    //             ];
    //         });

    //         // Nếu transaction không trả về gì (có lỗi nhưng không throw exception), thì báo lỗi
    //         if (!$completedOrderDetails) {
    //              throw new \Exception("Transaction failed without throwing an exception.");
    //         }
            
    //         // Sử dụng kết quả từ transaction để trả về response
    //         return response()->json([
    //             'message' => 'Order completed successfully!',
    //             'orderCode' => $completedOrderDetails['orderCode'],
    //         ]);

    //     } catch (\Exception $e) {
    //         Log::error('Order completion failed for OrderID ' . $orderId . ': ' . $e->getMessage() . ' in ' . $e->getFile() . ' on line ' . $e->getLine());
    //         return response()->json(['message' => 'An error occurred during order completion.', 'error' => $e->getMessage()], 500);
    //     }
    // }

// app/Http/Controllers/OrderController.php

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
    ]);
    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }
    $validatedData = $validator->validated();

    $order = DB::table('ordersbuyer')
        ->where('OrderID', $orderId)
        ->where('UserID', $user->UserID)
        ->where('PaymentStatus', 'Pending')
        ->where('OverallStatus', 'Pending')
        ->first();

    if (!$order) {
        return response()->json(['message' => 'Order not found or already processed.'], 404);
    }

    try {
        $completedOrderDetails = DB::transaction(function () use ($validatedData, $order, $orderId, $user) {
            $updates = ['UpdatedAt' => now()];
            $paymentMethod = $validatedData['paymentMethod'];

            if (($paymentMethod === 'Paypal' && isset($validatedData['paymentDetails']['status']) && $validatedData['paymentDetails']['status'] === 'COMPLETED')
                || ($paymentMethod === 'VNPay') // Tạm thời chấp nhận ngay
                || ($paymentMethod === 'COD')) 
            {
                // Cập nhật trạng thái cho đơn hàng tổng (ordersbuyer)
                $updates['OverallStatus'] = 'Processing';
                if ($paymentMethod !== 'COD') {
                    $updates['PaymentStatus'] = 'Paid';
                    $updates['paidAt'] = now();
                }
                DB::table('ordersbuyer')->where('OrderID', $orderId)->update($updates);

                // Cập nhật trạng thái cho TẤT CẢ các đơn hàng con (ordersseller)
                DB::table('ordersseller')
                    ->where('OrderID', $orderId)
                    ->update(['Status' => 'Processing', 'UpdatedAt' => now()]);

                Log::info("Order {$orderId} and its seller orders status updated to Processing.");

                // Lấy tất cả OrderItemID từ tất cả các đơn hàng con
                $sellerOrderIds = DB::table('ordersseller')->where('OrderID', $orderId)->pluck('SellerOrderID');
                $orderItems = DB::table('orderitems')->whereIn('SellerOrderID', $sellerOrderIds)->get();

                // Logic cập nhật tồn kho, sold count và xóa giỏ hàng giữ nguyên
                foreach ($orderItems as $item) {
                    DB::table('productvariants')
                        ->where('VariantID', $item->VariantID)
                        ->decrement('StockQuantity', $item->Quantity);
                }
                Log::info("Stock quantity updated for order {$orderId}.");
                
                $productIdsToUpdate = DB::table('productvariants')
                    ->whereIn('VariantID', $orderItems->pluck('VariantID'))
                    ->distinct()
                    ->pluck('ProductID', 'VariantID');

                $productSoldCount = [];
                foreach ($orderItems as $item) {
                    $productId = $productIdsToUpdate->get($item->VariantID);
                    if ($productId) {
                        if (!isset($productSoldCount[$productId])) $productSoldCount[$productId] = 0;
                        $productSoldCount[$productId] += $item->Quantity;
                    }
                }

                foreach ($productSoldCount as $productId => $quantitySold) {
                    DB::table('products')->where('ProductID', $productId)->increment('SoldCount', $quantitySold);
                }
                Log::info("SoldCount updated for products in order {$orderId}.", $productSoldCount);
                
                $cart = DB::table('carts')->where('UserID', $user->UserID)->first();
                if ($cart) {
                    $variantIdsToRemove = $orderItems->pluck('VariantID')->all();
                    DB::table('cartitems')->where('CartID', $cart->CartID)->whereIn('VariantID', $variantIdsToRemove)->delete();
                    Log::info("Items removed from cart for user {$user->UserID}.");
                }
            } else {
                Log::info("No status change for order {$orderId}. No further action taken.");
            }

            return ['orderCode' => $order->OrderCode];
        });

        if (!$completedOrderDetails) {
            throw new \Exception("Transaction failed without throwing an exception.");
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
                    // Chỉ hủy được đơn hàng đang ở trạng thái nháp
                    ->where('OverallStatus', 'Pending') 
                    ->first();

                // Nếu không tìm thấy đơn hàng hoặc đơn đã được xử lý, không làm gì cả
                if (!$order) {
                    return;
                }

                // Lấy lại các items đã đặt để khôi phục tồn kho
                $orderItems = DB::table('orderitems')->where('OrderID', $orderId)->get();

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
