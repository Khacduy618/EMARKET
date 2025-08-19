<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;
use App\Http\Controllers\OrderController;
use App\Traits\ManagesOrderProcessing;
use App\Traits\ManagesVoucherUsage;

class VNPayController extends Controller
{
    protected $orderController;
    use ManagesOrderProcessing;
    use ManagesVoucherUsage;
    // **INJECT OrderController QUA CONSTRUCTOR**
    public function __construct(OrderController $orderController)
    {
        $this->orderController = $orderController;
    }

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
                             $fullOrderDetails = DB::table('ordersbuyer')->where('OrderID', $order->OrderID)->first();
                       
                        $this->processConfirmedOrder($fullOrderDetails);
                        // Cập nhật trạng thái voucher nếu có
                        $this->updateUserVoucherUsage($fullOrderDetails);
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
