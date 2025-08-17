<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VnpayService
{
    protected $apiUrl;
    protected $tmnCode;
    protected $hashSecret;

    public function __construct()
    {
        // Lấy thông tin cấu hình từ file .env
        $this->apiUrl = config('services.vnpay.api_url'); // ví dụ: https://sandbox.vnpayment.vn/merchant_webapi/api/transaction
        $this->tmnCode = config('services.vnpay.tmn_code');
        $this->hashSecret = config('services.vnpay.hash_secret');
    }

    /**
     * Thực hiện yêu cầu hoàn tiền qua API của VNPay.
     *
     * @param array $data Dữ liệu cần thiết để hoàn tiền
     * @return array Kết quả từ VNPay
     */
public function refund(array $data)
{
    $requestId = rand(100000, 999999);
    $vnp_CreateBy = $data['create_by'];

    // THAY ĐỔI 1: Sử dụng một IP public thực sự để test (DNS của Google).
    $clientIp = '8.8.8.8'; 

    // THAY ĐỔI 2: Đơn giản hóa nội dung OrderInfo đến mức tối đa.
    $orderInfo = 'Hoantien' . $data['vnp_TxnRef']; 

    // THAY ĐỔI 3: Ép kiểu số tiền sang dạng chuỗi (string) để đảm bảo an toàn.
    $amount = (string)$data['amount'];

    $inputData = [
        "vnp_RequestId" => $requestId,
        "vnp_Version" => "2.1.0",
        "vnp_Command" => "refund",
        "vnp_TmnCode" => $this->tmnCode,
        "vnp_TransactionType" => "02",
        "vnp_TxnRef" => $data['vnp_TxnRef'],
        "vnp_Amount" => $amount, // Sử dụng biến đã ép kiểu
        "vnp_OrderInfo" => $orderInfo, // Sử dụng biến đã đơn giản hóa
        "vnp_TransactionNo" => $data['vnp_TransactionNo'],
        "vnp_TransactionDate" => $data['vnp_TransactionDate'],
        "vnp_CreateBy" => $vnp_CreateBy,
        "vnp_CreateDate" => date('YmdHis'),
        "vnp_IpAddr" => $clientIp
    ];

    ksort($inputData);

    $hashData = [];
    foreach ($inputData as $key => $value) {
        $hashData[] = $key . "=" . rawurlencode($value);
    }
    $hashDataString = implode('&', $hashData);

    $inputData['vnp_SecureHash'] = hash_hmac('sha512', $hashDataString, $this->hashSecret);

    Log::info('[LAST ATTEMPT] VNPay Refund Request URL: ' . $this->apiUrl);
    Log::info('[LAST ATTEMPT] VNPay HASHING STRING: ' . $hashDataString);
    Log::info('[LAST ATTEMPT] VNPay Refund Request Data: ', $inputData);

    try {
        $response = Http::asForm()->post($this->apiUrl, $inputData);
        
        $responseData = [];
        if ($response->body()) {
            parse_str($response->body(), $responseData);
        }

        Log::info('[LAST ATTEMPT] VNPay Refund Response: ', $responseData);

        if (empty($responseData) || !isset($responseData['vnp_ResponseCode'])) {
            Log::error('[LAST ATTEMPT] Phản hồi từ VNPay không hợp lệ.', ['response_body' => $response->body()]);
            return [
                'success' => false,
                'message' => 'Phản hồi từ VNPay không hợp lệ.',
                'data' => $responseData,
                'vnpay_request_id' => $requestId,
            ];
        }
        
        return [
            'success' => $responseData['vnp_ResponseCode'] === '00',
            'data' => $responseData,
            'vnpay_request_id' => $requestId,
        ];

    } catch (\Exception $e) {
        Log::error('[LAST ATTEMPT] Lỗi khi gọi API hoàn tiền VNPay: ' . $e->getMessage());
        return ['success' => false, 'message' => $e->getMessage(), 'vnpay_request_id' => $requestId];
    }
}
}