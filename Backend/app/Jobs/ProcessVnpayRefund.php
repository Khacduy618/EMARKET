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


    public function __construct(ReturnRequest $returnRequest)
    {
        $this->returnRequest = $returnRequest;
    }


    public function handle(VnpayService $vnpayService): void
    {
        // Giữ nguyên: Chỉ xử lý nếu trạng thái hợp lệ
        if ($this->returnRequest->Status !== 'Approved_ProcessingVnpayRefund') {
            Log::warning("Job hoàn tiền cho yêu cầu #{$this->returnRequest->ReturnRequestID} bị bỏ qua do trạng thái không hợp lệ: {$this->returnRequest->Status}");
            return;
        }


        // Thay vì `$this->returnRequest->order`, hãy load đầy đủ các quan hệ cần thiết một lần
        $this->returnRequest->load(['order', 'orderItem.sellerOrder']);
        $order = $this->returnRequest->order;


        // Giữ nguyên: Chuẩn bị dữ liệu cho VNPay
        $refundData = [
            'amount' => (int) $this->returnRequest->RefundAmount * 100,
            'vnp_TxnRef' => $order->VnpayTxnRef,
            'vnp_TransactionNo' => $order->VnpayTransactionNo,
            'vnp_TransactionDate' => $order->VnpayTransactionDate,
            'create_by' => 'system_job',
            'order_info' => 'Hoan tien cho don hang ' . $order->OrderCode . ' theo yeu cau ' . $this->returnRequest->ReturnRequestID
        ];


        // Giữ nguyên: Gọi service VNPay
        $result = $vnpayService->refund($refundData);
       
        // Giữ nguyên: Sử dụng transaction để đảm bảo an toàn dữ liệu
        DB::transaction(function () use ($result, $order) { // truyền biến $order vào transaction
            $this->returnRequest->refresh(); // Lấy lại dữ liệu mới nhất
            $this->returnRequest->VnpayRefundRequestId = $result['vnpay_request_id'] ?? null;


            if ($result['success']) {
                // Giữ nguyên: Cập nhật ReturnRequest
                $this->returnRequest->Status = 'Refunded';
                $this->returnRequest->VnpayResponseCode = $result['data']['vnp_ResponseCode'];
                $this->returnRequest->VnpayResponseMessage = 'Hoàn tiền thành công qua VNPay.';
               
                // Giữ nguyên: Cập nhật trạng thái đơn hàng tổng (OrderBuyer)
                // $order->PaymentStatus = 'Refunded';
                // $order->save();


                // === BẮT ĐẦU PHẦN THÊM MỚI ===
                // Lấy ra đơn hàng của người bán (SellerOrder) thông qua OrderItem
                $sellerOrder = $this->returnRequest->orderItem->sellerOrder;
                if ($sellerOrder) {
                    // Cập nhật trạng thái của SellerOrder thành 'Returned'
                    $sellerOrder->Status = 'Returned';
                    $sellerOrder->save();
                    Log::info("Đã cập nhật SellerOrder #{$sellerOrder->SellerOrderID} thành 'Returned' cho ReturnRequest #{$this->returnRequest->ReturnRequestID}.");
                } else {
                    Log::warning("Không tìm thấy SellerOrder liên quan đến ReturnRequest #{$this->returnRequest->ReturnRequestID} để cập nhật trạng thái.");
                }
                // === KẾT THÚC PHẦN THÊM MỚI ===


            } else {
                // Giữ nguyên: Xử lý khi thất bại
                $this->returnRequest->Status = 'RefundProcessingFailed';
                $this->returnRequest->VnpayResponseCode = $result['data']['vnp_ResponseCode'] ?? '99';
                $this->returnRequest->VnpayResponseMessage = $result['data']['vnp_Message'] ?? ($result['message'] ?? 'Lỗi không xác định.');
            }
            $this->returnRequest->save();
        });
    }
}


