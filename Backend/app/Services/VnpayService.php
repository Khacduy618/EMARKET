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
        $this->apiUrl = config('services.vnpay.api_url');
        $this->tmnCode = config('services.vnpay.tmn_code');
        $this->hashSecret = config('services.vnpay.hash_secret');
    }


    /**
     * Thực hiện yêu cầu hoàn tiền qua API của VNPay.
     * Có thể giả lập kết quả thành công qua biến môi trường VNPAY_SIMULATE_REFUND.
     *
     * @param array $data Dữ liệu cần thiết để hoàn tiền
     * @return array Kết quả từ VNPay
     */
    public function refund(array $data)
    {
        // KIỂM TRA BIẾN MÔI TRƯỜDNG ĐỂ GIẢ LẬP
        if (config('services.vnpay.simulate_refund', false)) {
            // === BẮT ĐẦU ĐOẠN CODE GIẢ LẬP ===
            Log::info("[SIMULATION MODE] Giả lập phản hồi hoàn tiền VNPay thành công.");


            // Tạo ra một phản hồi giả mạo giống hệt phản hồi thành công của VNPay
            $simulatedResponseData = [
                "vnp_ResponseId" => uniqid(),
                "vnp_Command" => "refund",
                "vnp_ResponseCode" => "00", // "00" là mã thành công!
                "vnp_Message" => "Simulated Success",
                "vnp_TmnCode" => $this->tmnCode,
                "vnp_TxnRef" => $data['vnp_TxnRef'],
                "vnp_Amount" => (string)$data['amount'],
                "vnp_OrderInfo" => 'Hoantien' . $data['vnp_TxnRef'],
                "vnp_BankCode" => "",
                "vnp_PayDate" => $data['vnp_TransactionDate'], // Lấy tạm ngày giao dịch
                "vnp_TransactionNo" => $data['vnp_TransactionNo'],
                "vnp_TransactionType" => "02",
                "vnp_TransactionStatus" => "00"
            ];
           
            // Trả về kết quả giả lập theo đúng cấu trúc bạn mong muốn
            return [
                'success' => true,
                'data' => $simulatedResponseData,
                'vnpay_request_id' => rand(100000, 999999),
            ];
            // === KẾT THÚC ĐOẠN CODE GIẢ LẬP ===
        }


        // === ĐOẠN CODE GỌI API THẬT (GIỮ NGUYÊN) ===
        $requestId = rand(100000, 999999);
        $vnp_CreateBy = $data['create_by'];
        $clientIp = '8.8.8.8';
        $orderInfo = 'Hoantien' . $data['vnp_TxnRef'];
        $amount = (string)$data['amount'];


        $inputData = [
            "vnp_RequestId" => $requestId,
            "vnp_Version" => "2.1.0",
            "vnp_Command" => "refund",
            "vnp_TmnCode" => $this->tmnCode,
            "vnp_TransactionType" => "02",
            "vnp_TxnRef" => $data['vnp_TxnRef'],
            "vnp_Amount" => $amount,
            "vnp_OrderInfo" => $orderInfo,
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


        Log::info('[API CALL] VNPay Refund Request URL: ' . $this->apiUrl);
        Log::info('[API CALL] VNPay HASHING STRING: ' . $hashDataString);
        Log::info('[API CALL] VNPay Refund Request Data: ', $inputData);


        try {
            // Thay đổi nhỏ: Dùng Http::post thay vì asForm nếu API endpoint nhận JSON
            // Nếu endpoint nhận x-www-form-urlencoded thì asForm() là đúng
            $response = Http::asForm()->post($this->apiUrl, $inputData);
           
            $responseData = [];
            if ($response->body()) {
                // Phản hồi của VNPay refund là dạng query string, parse_str là đúng
                parse_str($response->body(), $responseData);
            }


            Log::info('[API CALL] VNPay Refund Response: ', $responseData);


            if (empty($responseData) || !isset($responseData['vnp_ResponseCode'])) {
                Log::error('[API CALL] Phản hồi từ VNPay không hợp lệ.', ['response_body' => $response->body()]);
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
            Log::error('[API CALL] Lỗi khi gọi API hoàn tiền VNPay: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage(), 'vnpay_request_id' => $requestId];
        }
    }
}
