<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;

class VNPayController extends Controller
{
    
//      public function createPayment(Request $request, $orderId)
//     {
//         // === BƯỚC 1: GHI LOG VÀ KIỂM TRA XÁC THỰC ===
//         Log::info("--- VNPAY PAYMENT CREATION: START ---");
//         Log::info("Attempting to create payment for OrderID: [{$orderId}]");

//         $user = $request->user();

//         if (!$user) {
//             Log::error("VNPAY_ERROR: User is not authenticated. Cannot proceed.");
//             return response()->json(['message' => 'Người dùng chưa được xác thực.'], 401);
//         }

//         Log::info("Authenticated UserID: [{$user->UserID}]");

//         // === BƯỚC 2: TÌM ĐƠN HÀNG VÀ KIỂM TRA QUYỀN SỞ HỮU ===
//         $order = DB::table('ordersbuyer')
//             ->where('OrderID', $orderId)
//             ->first(); // Tạm thời chỉ tìm theo OrderID để debug

//         // Kiểm tra xem đơn hàng có tồn tại không
//         if (!$order) {
//             Log::error("VNPAY_ERROR: Order with ID [{$orderId}] does not exist in the database.");
//             return response()->json(['message' => 'Đơn hàng không tồn tại.'], 404);
//         }

//         // Kiểm tra xem đơn hàng có thuộc về đúng người dùng không
//         if ($order->UserID != $user->UserID) {
//             Log::error("VNPAY_SECURITY_ALERT: UserID [{$user->UserID}] is trying to pay for an order belonging to UserID [{$order->UserID}]. Access denied.");
//             return response()->json(['message' => 'Bạn không có quyền thanh toán cho đơn hàng này.'], 403);
//         }
        
//         // Kiểm tra trạng thái đơn hàng: Chỉ cho phép thanh toán đơn hàng đang 'Pending'
//         if ($order->OverallStatus !== 'Pending' || $order->PaymentStatus !== 'Pending') {
//             Log::warning("VNPAY_WARNING: Payment attempt on an already processed order. OrderID: [{$orderId}], Status: [{$order->OverallStatus}], PaymentStatus: [{$order->PaymentStatus}]");
//             return response()->json(['message' => 'Đơn hàng này đã được xử lý hoặc không còn hiệu lực để thanh toán.'], 400);
//         }

//         Log::info("Order found and validated successfully for UserID [{$user->UserID}].");
        
//         // === BƯỚC 3: CHUẨN BỊ DỮ LIỆU VÀ TẠO URL VNPAY ===

//         try {
//             $vnp_TmnCode = config('services.vnpay.tmn_code');
//             $vnp_HashSecret = config('services.vnpay.hash_secret');
//             $vnp_Url = config('services.vnpay.url');
//             $vnp_Returnurl = route('vnpay.return');

//             // Kiểm tra cấu hình có tồn tại không
//             if (!$vnp_TmnCode || !$vnp_HashSecret) {
//                 Log::critical('VNPAY_CONFIG_ERROR: VNPAY_TMN_CODE hoặc VNPAY_HASH_SECRET chưa được cấu hình trong file .env');
//                 return response()->json(['message' => 'Lỗi cấu hình hệ thống thanh toán.'], 500);
//             }

//             $vnp_TxnRef = $order->OrderCode;
//             $vnp_OrderInfo = "Thanh toan don hang " . $order->OrderCode;
//             $vnp_OrderType = 'billpayment';
//             $vnp_Amount = $order->TotalAmount * 100;
//             $vnp_Locale = 'vn';
//             $vnp_IpAddr = $request->ip();

//             $inputData = [
//                 "vnp_Version" => "2.1.0",
//                 "vnp_TmnCode" => $vnp_TmnCode,
//                 "vnp_Amount" => $vnp_Amount,
//                 "vnp_Command" => "pay",
//                 "vnp_CreateDate" => date('YmdHis'),
//                 "vnp_CurrCode" => "VND",
//                 "vnp_IpAddr" => $vnp_IpAddr,
//                 "vnp_Locale" => $vnp_Locale,
//                 "vnp_OrderInfo" => $vnp_OrderInfo,
//                 "vnp_OrderType" => $vnp_OrderType,
//                 "vnp_ReturnUrl" => $vnp_Returnurl,
//                 "vnp_TxnRef" => $vnp_TxnRef,
//             ];

//             ksort($inputData);
            
//             $hashdata = http_build_query($inputData);
//             $vnpSecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
//             $vnp_Url .= '?' . $hashdata . '&vnp_SecureHash=' . $vnpSecureHash;

//             // Cập nhật phương thức thanh toán trong đơn hàng (nếu cần)
//             DB::table('ordersbuyer')
//                 ->where('OrderID', $orderId)
//                 ->update(['PaymentMethod' => 'VNPay']);

//             Log::info("VNPAY PAYMENT CREATION: SUCCESS. Redirecting user to VNPAY.");
//             Log::debug("Generated VNPAY URL: " . $vnp_Url);

//             return response()->json(['payment_url' => $vnp_Url]);

//         } catch (\Exception $e) {
//             Log::error("VNPAY_FATAL_ERROR: An unexpected error occurred during URL generation.", [
//                 'error_message' => $e->getMessage(),
//                 'trace' => $e->getTraceAsString()
//             ]);
//             return response()->json(['message' => 'Đã có lỗi không mong muốn xảy ra. Vui lòng thử lại sau.'], 500);
//         }
//     }
//     /**
//      * Xử lý kết quả VNPay trả về.
//      */
//    public function handleReturn(Request $request)
//     {
//         $inputData = $request->all();
//         Log::info('--- Received return callback from VNPay ---', $inputData);

//         if (!isset($inputData['vnp_TxnRef']) || !isset($inputData['vnp_SecureHash'])) {
//             $frontendReturnUrl = config('services.vnpay.return_url');
//             Log::warning("VNPay return with missing required parameters.", $inputData);
//             return redirect()->away("{$frontendReturnUrl}?success=false&error=invalid_params");
//         }

//         $vnp_SecureHash = $inputData['vnp_SecureHash'];
//         unset($inputData['vnp_SecureHash']);

//         ksort($inputData);
//         $hashData = "";
//         $i = 0;
//         foreach ($inputData as $key => $value) {
//             if ($i == 1) {
//                 $hashData = $hashData . '&' . urlencode($key) . "=" . urlencode($value);
//             } else {
//                 $hashData = $hashData . urlencode($key) . "=" . urlencode($value);
//                 $i = 1;
//             }
//         }
//         $secureHash = hash_hmac('sha512', $hashData, config('services.vnpay.hash_secret'));
//         $orderCode = $inputData['vnp_TxnRef'];
//         $responseCode = $inputData['vnp_ResponseCode'] ?? '99';
//         $frontendReturnUrl = config('services.vnpay.return_url');

//         $order = DB::table('ordersbuyer')->where('OrderCode', $orderCode)->first();
//         $orderQueryParam = $order ? "&orderId={$order->OrderID}" : "";

//         if ($secureHash == $vnp_SecureHash) {
//             if ($responseCode == '00') {
//                 // Thanh toán thành công
//                 if ($order && $order->OverallStatus === 'Pending') {
//                     // [SỬA ĐỔI QUAN TRỌNG] Truyền $inputData vào transaction để sử dụng
//                     DB::transaction(function () use ($order, $inputData) {
                        
//                         // [THÊM MỚI] Lấy các thông tin cần thiết từ VNPAY để lưu lại
//                         $vnpayTxnRef = $inputData['vnp_TxnRef']; // Mã giao dịch của bạn
//                         $vnpayTransactionNo = $inputData['vnp_TransactionNo']; // Mã giao dịch của VNPAY
//                         $vnpayPayDate = $inputData['vnp_PayDate']; // Ngày giờ thanh toán

//                         // [SỬA ĐỔI] Cập nhật đơn hàng với các thông tin của VNPAY
//                         DB::table('ordersbuyer')->where('OrderID', $order->OrderID)
//                             ->update([
//                                 'PaymentStatus' => 'Paid', 
//                                 'OverallStatus' => 'Processing', 
//                                 'UpdatedAt' => now(),
//                                 'paidAt' => now(),

//                                 // Lưu các trường VNPAY để hoàn tiền sau này
//                                 'VnpayTxnRef' => $vnpayTxnRef,
//                                 'VnpayTransactionNo' => $vnpayTransactionNo,
//                                 'VnpayTransactionDate' => $vnpayPayDate,
//                             ]);
                        
//                         Log::info("Order {$order->OrderCode} paid successfully via VNPAY. Saved transaction info.", [
//                             'VnpayTxnRef' => $vnpayTxnRef,
//                             'VnpayTransactionNo' => $vnpayTransactionNo,
//                             'VnpayPayDate' => $vnpayPayDate
//                         ]);

//                         // Trừ kho và xóa giỏ hàng
//                         $orderItems = DB::table('orderitems')->where('SellerOrderID', $order->SellerOrderID)->get();
//                         foreach ($orderItems as $item) {
//                             DB::table('productvariants')->where('VariantID', $item->VariantID)->decrement('StockQuantity', $item->Quantity);
//                         }
//                         $cart = DB::table('carts')->where('UserID', '
//                         ', $order->UserID)->first();
//                         if ($cart) {
//                             $variantIdsToRemove = $orderItems->pluck('VariantID')->all();
//                             DB::table('cartitems')->where('CartID', $cart->CartID)->whereIn('VariantID', $variantIdsToRemove)->delete();
//                         }
//                     });
//                 }
//                 // Điều hướng về frontend thành công
//                return redirect()->away("{$frontendReturnUrl}?success=true&orderCode={$orderCode}");
//             } else {
//                 // Thanh toán thất bại hoặc bị hủy
//                 Log::warning("VNPay payment failed or was cancelled for order: {$orderCode}", $inputData);
//                 return redirect()->away("{$frontendReturnUrl}?success=false&orderCode={$orderCode}{$orderQueryParam}");
//             }
//         } else {
//             // Chữ ký không hợp lệ
//             Log::error("VNPay INVALID SIGNATURE for order: {$orderCode}", $inputData);
//             return redirect()->away("{$frontendReturnUrl}?success=false&orderCode={$orderCode}&error=invalid_signature");
//         }
//     }
public function createPayment(Request $request, $orderId)
{
    Log::info("--- VNPAY PAYMENT CREATION: START ---");
    Log::info("Attempting to create payment for OrderID: [{$orderId}]");

    $user = $request->user();
    if (!$user) {
        Log::error("VNPAY_ERROR: User is not authenticated.");
        return response()->json(['message' => 'Người dùng chưa được xác thực.'], 401);
    }

    $order = DB::table('ordersbuyer')->where('OrderID', $orderId)->where('UserID', $user->UserID)->first();

    if (!$order) {
        Log::error("VNPAY_ERROR: Order [{$orderId}] not found for UserID [{$user->UserID}].");
        return response()->json(['message' => 'Đơn hàng không tồn tại.'], 404);
    }
    
    if ($order->OverallStatus !== 'Pending' || $order->PaymentStatus !== 'Pending') {
        Log::warning("VNPAY_WARNING: Payment attempt on an already processed order [{$orderId}].");
        return response()->json(['message' => 'Đơn hàng này đã được xử lý.'], 400);
    }

    Log::info("Order found and validated successfully for UserID [{$user->UserID}].");
    
    try {
        $vnp_TmnCode = config('services.vnpay.tmn_code');
        $vnp_HashSecret = config('services.vnpay.hash_secret');
        $vnp_Url = config('services.vnpay.url');
        $vnp_Returnurl = route('vnpay.return');

        if (!$vnp_TmnCode || !$vnp_HashSecret) {
            Log::critical('VNPAY_CONFIG_ERROR: VNPAY_TMN_CODE or VNPAY_HASH_SECRET is not configured.');
            return response()->json(['message' => 'Lỗi cấu hình hệ thống thanh toán.'], 500);
        }

        $vnp_TxnRef = $order->OrderCode;
        $vnp_OrderInfo = "Thanh toan don hang " . $order->OrderCode;
        $vnp_OrderType = 'billpayment';
        $vnp_Amount = $order->TotalAmount * 100;
        $vnp_Locale = 'vn';
        $vnp_IpAddr = $request->ip();

        $inputData = [
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $vnp_TmnCode,
            "vnp_Amount" => $vnp_Amount,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => date('YmdHis'),
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => $vnp_IpAddr,
            "vnp_Locale" => $vnp_Locale,
            "vnp_OrderInfo" => $vnp_OrderInfo,
            "vnp_OrderType" => $vnp_OrderType,
            "vnp_ReturnUrl" => $vnp_Returnurl,
            "vnp_TxnRef" => $vnp_TxnRef,
        ];

        // Thêm trường bill_email nếu có thông tin email của user
        if (isset($user->Email)) {
            $inputData['vnp_Bill_Email'] = $user->Email;
        }

        ksort($inputData);
        
        // **SỬA LỖI TẠO HASHDATA**
        $hashdata = "";
        $query = "";
        $i = 0;
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashdata .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
            $query .= urlencode($key) . "=" . urlencode($value) . '&';
        }
        
        $vnp_Url = $vnp_Url . "?" . $query;
        $vnpSecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
        $vnp_Url .= 'vnp_SecureHash=' . $vnpSecureHash;

        DB::table('ordersbuyer')->where('OrderID', $orderId)->update(['PaymentMethod' => 'VNPay']);

        Log::info("VNPAY PAYMENT CREATION: SUCCESS. Redirecting user.");
        return response()->json(['payment_url' => $vnp_Url]);

    } catch (\Exception $e) {
        Log::error("VNPAY_FATAL_ERROR: URL generation failed.", ['error' => $e->getMessage()]);
        return response()->json(['message' => 'Đã có lỗi không mong muốn xảy ra.'], 500);
    }
}

public function handleReturn(Request $request)
{
    $inputData = $request->all();
    Log::info('--- [VNPAY_RETURN] Received callback from VNPay ---', $inputData);

    $vnp_HashSecret = config('services.vnpay.hash_secret');
    $frontendReturnUrl = config('services.vnpay.return_url');

    // Lấy chữ ký từ VNPay
    $vnp_SecureHash = $inputData['vnp_SecureHash'];
    
    // Xóa trường chữ ký và loại mã ngân hàng không cần thiết khỏi mảng dữ liệu
    unset($inputData['vnp_SecureHashType']);
    unset($inputData['vnp_SecureHash']);

    // Sắp xếp lại dữ liệu theo thứ tự alphabet của key
    ksort($inputData);

    // **PHẦN SỬA LỖI TẠO CHUỖI HASH**
    // Tạo chuỗi hash theo đúng quy định của VNPay
    $hashData = "";
    $i = 0;
    foreach ($inputData as $key => $value) {
        if ($i == 1) {
            $hashData = $hashData . '&' . urlencode($key) . "=" . urlencode($value);
        } else {
            $hashData = $hashData . urlencode($key) . "=" . urlencode($value);
            $i = 1;
        }
    }

    $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);
    
    $orderCode = $inputData['vnp_TxnRef'];
    $responseCode = $inputData['vnp_ResponseCode'] ?? '99';
    $order = DB::table('ordersbuyer')->where('OrderCode', $orderCode)->first();
    $orderQueryParam = $order ? "&orderId={$order->OrderID}" : "";

    // So sánh chữ ký
    if ($secureHash == $vnp_SecureHash) {
        Log::info("[VNPAY_RETURN] SIGNATURE MATCH for order: {$orderCode}");
        
        if ($responseCode == '00') {
            Log::info("[VNPAY_RETURN] Payment SUCCESS for order: {$orderCode}. Checking order status...");
            if ($order && $order->OverallStatus === 'Pending') {
                try {
                    DB::transaction(function () use ($order, $inputData) {
                        $vnpayTxnRef = $inputData['vnp_TxnRef'];
                        $vnpayTransactionNo = $inputData['vnp_TransactionNo'];
                        $vnpayPayDateStr = $inputData['vnp_PayDate'];
                        $paidAtTimestamp = Carbon::createFromFormat('YmdHis', $vnpayPayDateStr)->toDateTimeString();

                        DB::table('ordersbuyer')->where('OrderID', $order->OrderID)
                            ->update([
                                'PaymentStatus' => 'Paid', 
                                'OverallStatus' => 'Processing', 
                                'UpdatedAt' => now(),
                                'paidAt' => $paidAtTimestamp,
                                'VnpayTxnRef' => $vnpayTxnRef,
                                'VnpayTransactionNo' => $vnpayTransactionNo,
                                'VnpayTransactionDate' => $vnpayPayDateStr,
                            ]);
                        
                        DB::table('ordersseller')->where('OrderID', $order->OrderID)
                            ->update(['Status' => 'Processing', 'UpdatedAt' => now()]);

                        Log::info("[VNPAY_RETURN_TRANSACTION] Updated order status for OrderID: {$order->OrderID}");

                        $sellerOrderIds = DB::table('ordersseller')->where('OrderID', $order->OrderID)->pluck('SellerOrderID');
                        $orderItems = DB::table('orderitems')->whereIn('SellerOrderID', $sellerOrderIds)->get();
                        
                        if ($orderItems->isNotEmpty()) {
                            foreach ($orderItems as $item) {
                                DB::table('productvariants')->where('VariantID', $item->VariantID)->decrement('StockQuantity', $item->Quantity);
                            }
                            Log::info("[VNPAY_RETURN_TRANSACTION] Decremented stock for OrderID: {$order->OrderID}");

                            $cart = DB::table('carts')->where('UserID', $order->UserID)->first();
                            if ($cart) {
                                $variantIdsToRemove = $orderItems->pluck('VariantID')->all();
                                DB::table('cartitems')->where('CartID', $cart->CartID)->whereIn('VariantID', $variantIdsToRemove)->delete();
                                Log::info("[VNPAY_RETURN_TRANSACTION] Cleared cart items for UserID: {$order->UserID}");
                            }
                        }
                    });
                    
                    Log::info("[VNPAY_RETURN] Transaction for order {$orderCode} COMPLETED successfully.");
                    return redirect()->away("{$frontendReturnUrl}?success=true&orderCode={$orderCode}");

                } catch (\Exception $e) {
                    Log::error("[VNPAY_RETURN] TRANSACTION FAILED for order {$orderCode}: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
                    return redirect()->away("{$frontendReturnUrl}?success=false&orderCode={$orderCode}{$orderQueryParam}&error=processing_failed");
                }
            } else {
                 Log::warning("[VNPAY_RETURN] Order {$orderCode} was already processed or not found. Status: " . ($order->OverallStatus ?? 'NOT_FOUND'));
                 return redirect()->away("{$frontendReturnUrl}?success=true&orderCode={$orderCode}");
            }
        } else {
            Log::warning("[VNPAY_RETURN] Payment FAILED or CANCELLED for order: {$orderCode}", $inputData);
            return redirect()->away("{$frontendReturnUrl}?success=false&orderCode={$orderCode}{$orderQueryParam}");
        }
    } else {
        Log::error("[VNPAY_RETURN] INVALID SIGNATURE for order: {$orderCode}. Expected: {$secureHash}, Received: {$vnp_SecureHash}");
        return redirect()->away("{$frontendReturnUrl}?success=false&orderCode={$orderCode}&error=invalid_signature");
    }
}

}
