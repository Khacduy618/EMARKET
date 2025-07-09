<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller

{

     /**
     * Hiển thị thông tin chi tiết của một đơn hàng.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $orderId
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request, $orderId)
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
        $orderItems = DB::table('orderitems as oi')
            ->join('productvariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
            ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
            ->join('shops as s', 'p.ShopID', '=', 's.ShopID')
            ->select(
                'oi.OrderItemID',
                'oi.VariantID as variantId',
                'oi.Quantity as quantity',
                'oi.PriceAtPurchase as price',
                'oi.Subtotal as subtotal',
                'p.ProductID as productId',
                'p.Name as name',
                'pv.ImageURL as imageUrl', // Lấy ảnh từ variant
                'p.ShopID as shopId',
                's.ShopName as shopName',
                's.Level as shopLevel'
                // Thêm Classification nếu cần
            )
            ->where('oi.OrderID', $orderId)
            ->get();
            
        // 4. (Quan trọng) Gom nhóm các sản phẩm lại theo từng cửa hàng (shop)
        $shopOrders = [];
        foreach ($orderItems as $item) {
            // Lấy classification cho từng item
            $attributes = DB::table('productvariantattribute as pva')
                ->join('attributevalues as av', 'pva.AttributeValueID', '=', 'av.AttributeValueID')
                ->join('attributes as a', 'av.AttributeID', '=', 'a.AttributeID')
                ->where('pva.VariantID', $item->variantId)
                ->select('a.Name as attributeName', 'av.Value as attributeValue')
                ->get();

            $item->classification = $attributes->map(function ($attr) {
                return $attr->attributeValue;
            })->implode(', ');

            if (!isset($shopOrders[$item->shopId])) {
                // Nếu shop chưa có trong danh sách, tạo mới
                $shopOrders[$item->shopId] = [
                    'shopId' => $item->shopId,
                    'shopName' => $item->shopName,
                    'shopLevel' => $item->shopLevel,
                    'items' => [],
                    // Các thông tin khác của shopOrder có thể thêm ở đây nếu cần
                    'shippingFee' => 30000, // << LƯU Ý: Lấy giá trị thực tế nếu có
                ];
            }
            // Thêm item vào shop tương ứng
            $shopOrders[$item->shopId]['items'][] = $item;
        }

        // 5. Tạo cấu trúc dữ liệu trả về giống với `checkoutData` của frontend
        $responsePayload = [
            'OrderID' => $order->OrderID,
            'OrderCode' => $order->OrderCode,
            'SubtotalAmount' => (int) $order->SubtotalAmount,
            'ShippingFee' => (int) $order->ShippingFee,
            'DiscountAmount' => (int) $order->DiscountAmount,
            'TotalAmount' => (int) $order->TotalAmount,
            'PaymentMethod' => $order->PaymentMethod,
            'address' => $address,
            'shopOrders' => array_values($shopOrders), // Chuyển từ associative array sang indexed array
        ];
        
        return response()->json($responsePayload);
    }

    /**
     * Tạo một đơn hàng ở trạng thái "Pending" (khi người dùng nhấn Place Order).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function placeOrder(Request $request)
    {
        // Validation tương tự như hàm create, nhưng không cần thông tin thanh toán
        $validator = Validator::make($request->all(), [
            'shippingAddressId'     => 'required|integer|exists:addresses,AddressID',
            'shippingFullName'      => 'required|string|max:255',
            'shippingPhoneNumber'   => 'required|string|max:20',
            'notes'                 => 'nullable|string',
            'totalAmount'           => 'required|numeric|min:0',
            'subtotalAmount'        => 'required|numeric|min:0',
            'shippingFee'           => 'required|numeric|min:0',
            'discountAmount'        => 'required|numeric|min:0',
            'paymentMethod'         => 'required|string|in:COD,Paypal', // Chỉ chấp nhận 2 loại này từ frontend
            'items'                 => 'required|array|min:1',
            'items.*.variantId'     => 'required|integer|exists:productvariants,VariantID',
            'items.*.quantity'      => 'required|integer|min:1',
            'items.*.priceAtPurchase' => 'required|numeric|min:0',
            'items.*.subtotal'      => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        $user = $request->user();

        try {
            // Dùng transaction để đảm bảo toàn vẹn
            $order = DB::transaction(function () use ($validatedData, $user) {
                
                $orderCode = 'EMK' . Carbon::now()->format('Ymd') . strtoupper(Str::random(6));
                
                // Mặc định tất cả đều là Pending
                $paymentStatus = 'Pending';
                $overallStatus = 'Pending';
                // Chuyển đổi paymentMethod từ 'Paypal' -> 'Paypal' để lưu vào DB
                $paymentMethodEnum = ($validatedData['paymentMethod'] === 'Paypal') ? 'Paypal' : 'COD';

                // Insert vào bảng `ordersbuyer`
                $orderId = DB::table('ordersbuyer')->insertGetId([
                    'OrderCode'           => $orderCode,
                    'UserID'              => $user->UserID,
                    'TotalAmount'         => $validatedData['totalAmount'],
                    'SubtotalAmount'      => $validatedData['subtotalAmount'],
                    'ShippingFee'         => $validatedData['shippingFee'],
                    'DiscountAmount'      => $validatedData['discountAmount'],
                    'ShippingAddressID'   => $validatedData['shippingAddressId'],
                    'ShippingFullName'    => $validatedData['shippingFullName'],
                    'ShippingPhoneNumber' => $validatedData['shippingPhoneNumber'],
                    'Notes'               => $validatedData['notes'],
                    'PaymentMethod'       => $paymentMethodEnum,
                    'PaymentStatus'       => $paymentStatus,
                    'OverallStatus'       => $overallStatus,
                    // Bỏ qua các cột voucher, có thể thêm sau nếu cần
                    'CreatedAt'          => now(),
                    'UpdatedAt'          => now(),
                ]);

                // Insert hàng loạt vào `orderitems`
                $orderItems = [];
                foreach ($validatedData['items'] as $item) {
                    $orderItems[] = [
                        'OrderID'         => $orderId,
                        'VariantID'       => $item['variantId'],
                        'Quantity'        => $item['quantity'],
                        'PriceAtPurchase' => $item['priceAtPurchase'],
                        'Subtotal'        => $item['subtotal'],
                        'CreatedAt'      => now(),
                    ];
                }
                DB::table('orderitems')->insert($orderItems);
                
                // Cập nhật tồn kho
                // foreach ($validatedData['items'] as $item) {
                //     DB::table('productvariants')
                //         ->where('VariantID', $item['variantId'])
                //         ->decrement('StockQuantity', $item['quantity']);
                // }

                // // Xóa khỏi giỏ hàng
                // $cart = DB::table('carts')->where('UserID', $user->UserID)->first();
                // if ($cart) {
                //     $variantIdsToRemove = array_column($validatedData['items'], 'variantId');
                //     DB::table('cartitems')
                //         ->where('CartID', $cart->CartID)
                //         ->whereIn('VariantID', $variantIdsToRemove)
                //         ->delete();
                // }

                return [
                    'orderId' => $orderId,
                    'orderCode' => $orderCode,
                ];
            });

            return response()->json([
                'message'   => 'Order placed successfully in pending state!',
                'orderId'   => $order['orderId'],
                'orderCode' => $order['orderCode'],
            ], 201);

        } catch (\Exception $e) {
            Log::error('Placing order failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while placing the order.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hoàn tất một đơn hàng đã tồn tại (sau khi thanh toán).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $orderId
     * @return \Illuminate\Http\JsonResponse
     */
    public function completeOrder(Request $request, $orderId)
    {
        $user = $request->user();

        // Validate dữ liệu thanh toán
        $validator = Validator::make($request->all(), [
            'paymentMethod'      => 'required|string|in:PAYPAL,COD',
            'paymentDetails'     => 'nullable|array',
            'paymentDetails.transactionId' => 'required_if:paymentMethod,PAYPAL|string',
            'paymentDetails.status' => 'required_if:paymentMethod,PAYPAL|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $validatedData = $validator->validated();

        // Tìm đơn hàng nháp
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
            // === SỬA LỖI: Gán kết quả của transaction cho một biến mới ===
            $completedOrderDetails = DB::transaction(function () use ($validatedData, $order, $orderId, $user) {
                
                // Xác định trạng thái mới
                $paymentStatus = $order->PaymentStatus;
                $overallStatus = $order->OverallStatus;

                if ($validatedData['paymentMethod'] === 'PAYPAL' && isset($validatedData['paymentDetails']['status']) && $validatedData['paymentDetails']['status'] === 'COMPLETED') {
                    $paymentStatus = 'Paid';
                    $overallStatus = 'Processing';
                } elseif ($validatedData['paymentMethod'] === 'COD') {
                    $overallStatus = 'Processing';
                }

                // 1. Cập nhật đơn hàng
                DB::table('ordersbuyer')
                    ->where('OrderID', $orderId)
                    ->update([
                        'PaymentStatus' => $paymentStatus,
                        'OverallStatus' => $overallStatus,
                        'UpdatedAt'    => now(),
                    ]);

                // Lấy lại các items trong đơn hàng
                $orderItems = DB::table('orderitems')->where('OrderID', $orderId)->get();

                // 2. Cập nhật tồn kho
                foreach ($orderItems as $item) {
                    DB::table('productvariants')
                        ->where('VariantID', $item->VariantID)
                        ->decrement('StockQuantity', $item->Quantity);
                }

                // 3. Xóa khỏi giỏ hàng
                $cart = DB::table('carts')->where('UserID', $user->UserID)->first();
                if ($cart) {
                    $variantIdsToRemove = $orderItems->pluck('VariantID')->all();
                    DB::table('cartitems')
                        ->where('CartID', $cart->CartID)
                        ->whereIn('VariantID', $variantIdsToRemove)
                        ->delete();
                }

                // === SỬA LỖI: Trả về dữ liệu cần thiết từ closure ===
                return [
                    'orderCode' => $order->OrderCode,
                ];
            });

            // Nếu transaction không trả về gì (có lỗi nhưng không throw exception), thì báo lỗi
            if (!$completedOrderDetails) {
                 throw new \Exception("Transaction failed without throwing an exception.");
            }
            
            // Sử dụng kết quả từ transaction để trả về response
            return response()->json([
                'message' => 'Order completed successfully!',
                'orderCode' => $completedOrderDetails['orderCode'],
            ]);

        } catch (\Exception $e) {
            Log::error('Order completion failed for OrderID ' . $orderId . ': ' . $e->getMessage() . ' in ' . $e->getFile() . ' on line ' . $e->getLine());
            return response()->json(['message' => 'An error occurred during order completion.', 'error' => $e->getMessage()], 500);
        }
    }
}
