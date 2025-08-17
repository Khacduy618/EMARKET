<?php

namespace App\Jobs;

use App\Models\ReturnRequest;
use App\Services\VnpayService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ProcessVnpayRefund implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $returnRequest;

    /**
     * Create a new job instance.
     */
    public function __construct(ReturnRequest $returnRequest)
    {
        $this->returnRequest = $returnRequest;
    }

    /**
     * Execute the job.
     */
    public function handle(VnpayService $vnpayService): void
    {
        // Chỉ xử lý nếu trạng thái vẫn là đang chờ xử lý hoàn tiền
        if ($this->returnRequest->Status !== 'Approved_ProcessingVnpayRefund') {
            Log::warning("Job hoàn tiền cho yêu cầu #{$this->returnRequest->ReturnRequestID} bị bỏ qua do trạng thái không hợp lệ: {$this->returnRequest->Status}");
            return;
        }

        $order = $this->returnRequest->order;
        
        $refundData = [
            'amount' => (int) $this->returnRequest->RefundAmount * 100,
            'vnp_TxnRef' => $order->VnpayTxnRef,
            'vnp_TransactionNo' => $order->VnpayTransactionNo,
            'vnp_TransactionDate' => $order->VnpayTransactionDate,
            'create_by' => 'system_seller_approve',
            'order_info' => 'Hoan tien cho don hang ' . $order->OrderCode . ' theo yeu cau ' . $this->returnRequest->ReturnRequestID
        ];

        $result = $vnpayService->refund($refundData);
        
        // Cập nhật lại kết quả vào CSDL
        DB::transaction(function () use ($result) {
            $this->returnRequest->refresh(); // Lấy lại dữ liệu mới nhất từ DB
            $this->returnRequest->VnpayRefundRequestId = $result['vnpay_request_id'] ?? null;

            if ($result['success']) {
                $this->returnRequest->Status = 'Refunded';
                $this->returnRequest->VnpayResponseCode = $result['data']['vnp_ResponseCode'];
                $this->returnRequest->VnpayResponseMessage = 'Hoàn tiền thành công qua VNPay.';
                
                // Cập nhật trạng thái đơn hàng
                $order = $this->returnRequest->order;
                $order->PaymentStatus = 'Refunded';
                $order->save();
            } else {
                $this->returnRequest->Status = 'RefundProcessingFailed'; // Nên thêm trạng thái này vào ENUM
                $this->returnRequest->VnpayResponseCode = $result['data']['vnp_ResponseCode'] ?? '99';
                $this->returnRequest->VnpayResponseMessage = $result['data']['vnp_Message'] ?? ($result['message'] ?? 'Lỗi không xác định.');
            }
            $this->returnRequest->save();
        });
    }
}