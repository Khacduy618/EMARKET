<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VNPayController extends Controller
{
    /**
     * Tạo URL thanh toán VNPay cho một đơn hàng.
     */
    public function createPayment(Request $request, $orderId)
    {
        Log::info("--- Received request for VnPay createPayment for OrderID: {$orderId} ---");
        $user = $request->user();
        $order = DB::table('ordersbuyer')->where('OrderID', $orderId)->where('UserID', $user->UserID)->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        // === BẮT ĐẦU LOGIC TẠO URL VNPAY ===

        $vnp_TmnCode = config('services.vnpay.tmn_code');
        $vnp_HashSecret = config('services.vnpay.hash_secret');
        $vnp_Url = config('services.vnpay.url');
        // Log::info("--- Received request for VnPay createPayment for OrderID: {$orderId} ---");
        // URL trả về này sẽ được VNPay gọi, nên nó phải là một URL public mà server của bạn có thể truy cập.
        // route('vnpay.return') sẽ tạo ra URL đầy đủ, ví dụ: http://your-laravel-app.com/api/vnpay/return
        $vnp_Returnurl = route('vnpay.return'); 
        
        $vnp_TxnRef = $order->OrderCode; // Mã đơn hàng.
        $vnp_OrderInfo = "Thanh toan don hang " . $order->OrderCode;
        $vnp_OrderType = 'billpayment'; // Loại hàng hóa
        $vnp_Amount = $order->TotalAmount * 100; // Số tiền thanh toán, nhân 100
        $vnp_Locale = 'vn'; // Ngôn ngữ
        $vnp_BankCode = ''; // Để trống để khách hàng tự chọn ngân hàng
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

        if (isset($vnp_BankCode) && $vnp_BankCode != "") {
            $inputData['vnp_BankCode'] = $vnp_BankCode;
        }
    Log::info('[VNPay] Preparing to send data:', $inputData);

        // Sắp xếp dữ liệu theo key
        ksort($inputData);
        
        $query = "";
        $i = 0;
        $hashdata = "";
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
        if (isset($vnp_HashSecret)) {
            $vnpSecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
            $vnp_Url .= 'vnp_SecureHash=' . $vnpSecureHash;
        }
        
        
        // Cập nhật phương thức thanh toán trong đơn hàng nháp
        DB::table('ordersbuyer')
            ->where('OrderID', $orderId)
            ->update(['PaymentMethod' => 'VNPay']);
            Log::info("VnPay createPayment: Generated payment URL successfully.", ['url' => $vnp_Url]);
            Log::info('VNPay Input Data:', $inputData);
        return response()->json(['payment_url' => $vnp_Url]);
    }

    /**
     * Xử lý kết quả VNPay trả về.
     */
    public function handleReturn(Request $request)
    {
        $inputData = $request->all();
       
        Log::info('--- Received return callback from VNPay ---', $inputData);

        // === SỬA LỖI: KIỂM TRA SỰ TỒN TẠI CỦA CÁC KEY QUAN TRỌNG ===
        
        // Nếu không có các key cơ bản này, coi như là một callback không hợp lệ hoặc đã bị hủy
        if (!isset($inputData['vnp_TxnRef']) || !isset($inputData['vnp_SecureHash'])) {
            $frontendReturnUrl = config('services.vnpay.return_url');
            Log::warning("VNPay return with missing required parameters.", $inputData);
            return redirect()->away("{$frontendReturnUrl}?success=false&error=invalid_params");
        }

        $vnp_SecureHash = $inputData['vnp_SecureHash'];
        unset($inputData['vnp_SecureHash']);

        ksort($inputData);
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
        $secureHash = hash_hmac('sha512', $hashData, config('services.vnpay.hash_secret'));

        $orderCode = $inputData['vnp_TxnRef'];
        // Sử dụng toán tử ?? để gán giá trị mặc định nếu key không tồn tại
        $responseCode = $inputData['vnp_ResponseCode'] ?? '99'; // Mặc định là lỗi nếu không có
        $frontendReturnUrl = config('services.vnpay.return_url');

        $order = DB::table('ordersbuyer')->where('OrderCode', $orderCode)->first();
        $orderQueryParam = $order ? "&orderId={$order->OrderID}" : "";

        if ($secureHash == $vnp_SecureHash) {
            if ($responseCode == '00') {
                // Thanh toán thành công
                if ($order && $order->OverallStatus === 'Pending') {
                    // Dùng transaction để đảm bảo toàn vẹn
                    DB::transaction(function () use ($order) {
                        DB::table('ordersbuyer')->where('OrderID', $order->OrderID)
                            ->update(['PaymentStatus' => 'Paid', 'OverallStatus' => 'Processing', 'UpdatedAt' => now()]);
                        
                        $orderItems = DB::table('orderitems')->where('OrderID', $order->OrderID)->get();
                        foreach ($orderItems as $item) {
                            DB::table('productvariants')->where('VariantID', $item->VariantID)->decrement('StockQuantity', $item->Quantity);
                        }
                        $cart = DB::table('carts')->where('UserID', '
                        ', $order->UserID)->first();
                        if ($cart) {
                            $variantIdsToRemove = $orderItems->pluck('VariantID')->all();
                            DB::table('cartitems')->where('CartID', $cart->CartID)->whereIn('VariantID', $variantIdsToRemove)->delete();
                        }
                    });
                }
                // Điều hướng về frontend thành công
               return redirect()->away("{$frontendReturnUrl}?success=true&orderCode={$orderCode}");
            } else {
                // Thanh toán thất bại hoặc bị hủy (responseCode khác 00)
                Log::warning("VNPay payment failed or was cancelled for order: {$orderCode}", $inputData);
                return redirect()->away("{$frontendReturnUrl}?success=false&orderCode={$orderCode}{$orderQueryParam}");
            }
        } else {
            // Chữ ký không hợp lệ
            Log::error("VNPay INVALID SIGNATURE for order: {$orderCode}", $inputData);
            return redirect()->away("{$frontendReturnUrl}?success=false&orderCode={$orderCode}&error=invalid_signature");
        }
    }

}
