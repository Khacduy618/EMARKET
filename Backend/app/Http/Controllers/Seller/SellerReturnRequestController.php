<?php
namespace App\Http\Controllers\Seller;


use App\Http\Controllers\Controller;
use App\Jobs\ProcessVnpayRefund;
use App\Models\ReturnRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Models\Orderitem; // Đảm bảo đã import model Orderitem
use App\Services\WebhookService;


class SellerReturnRequestController extends Controller
{
    /**
     * [SELLER-READ] Lấy danh sách các yêu cầu trả hàng cho shop của người bán.
     */
    // public function index(Request $request)
    // {
    //     $seller = Auth::user();
    //     if (!$seller->shop) {
    //         return response()->json(['message' => 'Tài khoản người bán này không được liên kết với bất kỳ cửa hàng nào.'], 403);
    //     }


    //     $shopId = $seller->shop->ShopID;


    //     // Tải trước các quan hệ (eager load) để tăng hiệu suất
    //     $query = ReturnRequest::where('ShopID', $shopId)
    //         ->with([
    //             'user:UserID,FullName',
    //             'order:OrderID,OrderCode,TotalAmount,PaymentMethod',
    //             'orderItem.variant.product:ProductID,Name' // Tải thông tin sản phẩm cần thiết
    //         ]);


    //     if ($request->has('status') && !empty($request->status)) {
    //         $query->where('Status', $request->status);
    //     }


    //     $requests = $query->orderBy('RequestedAt', 'desc')->paginate(15);


    //     return response()->json($requests);
    // }
     public function index(Request $request)
    {
        $seller = Auth::user();


        // Kiểm tra xem người dùng có phải là seller và có shop hay không
        if (!$seller->shop) {
            return response()->json(['message' => 'Tài khoản người bán này không được liên kết với bất kỳ cửa hàng nào.'], 403);
        }


        $shopId = $seller->shop->ShopID;


        // Tải trước các quan hệ (eager load) để tăng hiệu suất
        $query = ReturnRequest::where('ShopID', $shopId)
            ->with([
                // Tải thông tin người mua (user)
                'user:UserID,FullName,Avatar', // Thêm AvatarURL nếu có


                // [SỬA 1] Sửa tên quan hệ từ 'order' thành 'orderBuyer' cho đúng với Model
                // Tải thông tin đơn hàng tổn
                'orderBuyer:OrderID,OrderCode',


                // [SỬA 2] Tải đầy đủ thông tin sản phẩm để hiển thị
                'orderItem' => function ($query) {
                    $query->select('OrderItemID', 'VariantID', 'Quantity', 'PriceAtPurchase')
                          ->with([
                                'variant:VariantID,ProductID,Sku,ImageURL', // Lấy thông tin variant
                                'variant.product:ProductID,Name' // Lấy tên sản phẩm
                           ]);
                },
               
                // Thêm quan hệ này để lấy mã đơn hàng con nếu cần
                'sellerOrder:SellerOrderID,SellerOrderCode'
            ]);


        // Lọc theo trạng thái nếu có
        if ($request->has('status') && !empty($request->status)) {
            $query->where('Status', $request->status);
        }


        $requests = $query->orderBy('RequestedAt', 'desc')->paginate(15);


        // API Resource sẽ là cách tốt nhất để định dạng lại dữ liệu này,
        // nhưng tạm thời trả về trực tiếp cũng được.
        return response()->json($requests);
    }


    /**
     * [SELLER-READ] Lấy thông tin chi tiết của một yêu cầu.
     */
public function show($id)
{
    $seller = Auth::user();
    if (!$seller->shop) {
         return response()->json(['message' => 'Tài khoản người bán không có cửa hàng.'], 403);
    }


    $returnRequest = ReturnRequest::where('ReturnRequestID', $id)
        ->where('ShopID', $seller->shop->ShopID)
        ->with([
            'user:UserID,FullName,Phone',
            'order.shippingAddress',
            'orderItem.variant.product',
            'orderItem.variant.attributes.attribute'
        ])
        ->first();


    if (!$returnRequest) {
        return response()->json(['message' => 'Không tìm thấy yêu cầu.'], 404);
    }


    // Chuyển đổi model thành mảng để dễ dàng tùy chỉnh
    $responseData = $returnRequest->toArray();


    // Thêm một trường mới 'refund_details' để chứa thông tin hoàn tiền
    $responseData['refund_details'] = null;


    // Lấy phương thức thanh toán của đơn hàng gốc
    $paymentMethod = $returnRequest->order->PaymentMethod;
   
    // Giả định rằng thanh toán COD sẽ được hoàn tiền qua Chuyển khoản ngân hàng
    if ($paymentMethod === 'COD' || $returnRequest->RefundMethod === 'BankTransfer') {
        $responseData['refund_details'] = [
            'method' => 'Chuyển khoản Ngân hàng',
            'bank_name' => $returnRequest->RefundBankName,
            'account_number' => $returnRequest->RefundAccountNumber,
            'account_holder_name' => $returnRequest->RefundAccountHolderName,
        ];
    } elseif ($paymentMethod === 'VNPay' || $returnRequest->RefundMethod === 'VNPAY') {
        $responseData['refund_details'] = [
            'method' => 'VNPAY',
            'vnpay_request_id' => $returnRequest->VnpayRefundRequestId,
            'vnpay_response_code' => $returnRequest->VnpayResponseCode,
            'vnpay_response_message' => $returnRequest->VnpayResponseMessage,
        ];
    }


    // (Tùy chọn) Xóa các trường gốc để response gọn gàng hơn
    unset(
        $responseData['RefundBankName'],
        $responseData['RefundAccountNumber'],
        $responseData['RefundAccountHolderName'],
        $responseData['RefundMethod'],
        $responseData['VnpayRefundRequestId'],
        $responseData['VnpayResponseCode'],
        $responseData['VnpayResponseMessage']
    );




    return response()->json($responseData);
}
 
    // public function respond(Request $request, $id)
    // {
    //     // 1. Xác thực người dùng và dữ liệu đầu vào
    //     $seller = Auth::user();
    //     if (!$seller->shop) {
    //         return response()->json(['message' => 'Tài khoản người bán không có cửa hàng.'], 403);
    //     }


    //     $validator = Validator::make($request->all(), [
    //         'action' => 'required|in:approve,reject',
    //         'seller_note' => 'nullable|string|max:1000',
    //     ]);


    //     if ($validator->fails()) {
    //         return response()->json(['errors' => $validator->errors()], 422);
    //     }


    //     // 2. Sử dụng Transaction để đảm bảo toàn vẹn dữ liệu
    //     DB::beginTransaction();
    //     try {
    //         // Lấy yêu cầu và khóa dòng dữ liệu để tránh xung đột
    //         $returnRequest = ReturnRequest::with('order', 'orderItem')
    //             ->where('ReturnRequestID', $id)
    //             ->where('ShopID', $seller->shop->ShopID)
    //             ->lockForUpdate()
    //             ->first();


    //         // Kiểm tra sự tồn tại và trạng thái của yêu cầu
    //         if (!$returnRequest) {
    //             DB::rollBack();
    //             return response()->json(['message' => 'Không tìm thấy yêu cầu.'], 404);
    //         }


    //         if ($returnRequest->Status !== 'PendingSellerApproval') {
    //             DB::rollBack();
    //             return response()->json(['message' => 'Yêu cầu này đã được xử lý trước đó.'], 409);
    //         }
           
    //         $action = $request->input('action');
    //         $sellerNote = $request->input('seller_note');
           
    //         // 3. Xử lý logic dựa trên hành động 'approve' hoặc 'reject'
    //         if ($action === 'approve') {
    //             $returnRequest->SellerNote = $sellerNote ?? 'Yêu cầu được chấp thuận.';


    //             // Phân loại logic dựa trên loại yêu cầu (Trả hàng hay Hoàn tiền)
    //             if ($returnRequest->RequestType === 'Return') {
    //                 $returnRequest->Status = 'SellerApproved_WaitForReturn'; // Chờ người mua gửi hàng
    //             }
    //             elseif ($returnRequest->RequestType === 'Refund') {
    //                 $paymentMethod = $returnRequest->order->PaymentMethod;
    //                 if ($paymentMethod === 'VNPay') {
    //                     $returnRequest->Status = 'Approved_ProcessingVnpayRefund'; // Sẵn sàng để hệ thống tự động hoàn tiền
    //                 } else {
    //                     $returnRequest->Status = 'Approved_WaitForBankTransfer'; // Cần người bán tự chuyển khoản
    //                 }
    //             }
               
    //             // Cập nhật trạng thái của item trong đơn hàng
    //             if ($returnRequest->orderItem) {
    //                 $returnRequest->orderItem->ReturnStatus = 'Approved';
    //                 $returnRequest->orderItem->save();
    //             }


    //         } else { // action === 'reject'
    //             $returnRequest->Status = 'SellerRejected';
    //             $returnRequest->SellerNote = $sellerNote ?? 'Yêu cầu bị từ chối.';
               
    //             if ($returnRequest->orderItem) {
    //                 $returnRequest->orderItem->ReturnStatus = 'Rejected';
    //                 $returnRequest->orderItem->save();
    //             }
    //         }


    //         // Lưu thay đổi vào CSDL
    //         $returnRequest->save();
           
    //         // 4. Kích hoạt quy trình tự động nếu cần
    //         // Sau khi đã lưu trạng thái mới, kiểm tra nếu cần đẩy Job vào Queue
    //         if ($action === 'approve' && $returnRequest->Status === 'Approved_ProcessingVnpayRefund') {
    //             // Gửi công việc xử lý hoàn tiền VNPay vào hàng đợi để chạy nền
    //             ProcessVnpayRefund::dispatch($returnRequest);
    //             Log::info("Đã đẩy yêu cầu hoàn tiền VNPay #{$returnRequest->ReturnRequestID} vào hàng đợi.");
    //         }


    //         // Hoàn tất transaction
    //         DB::commit();


    //         // 5. Trả về phản hồi thành công cho người bán
    //         return response()->json([
    //             'message' => 'Phản hồi yêu cầu thành công! Yêu cầu hoàn tiền (nếu có) sẽ được hệ thống tự động xử lý.',
    //             'data' => $returnRequest->fresh(['order', 'orderItem']) // Lấy dữ liệu mới nhất
    //         ]);


    //     } catch (\Exception $e) {
    //         // Nếu có lỗi, rollback transaction và ghi log
    //         DB::rollBack();
    //         Log::error("Lỗi khi seller xử lý yêu cầu trả hàng #{$id}: " . $e->getMessage());
    //         return response()->json(['message' => 'Đã có lỗi xảy ra phía máy chủ, vui lòng thử lại.'], 500);
    //     }
    // }
    public function respond(Request $request, $id)
    {
        // 1. Xác thực người dùng và dữ liệu đầu vào
        $seller = Auth::user(); // Nạp sẵn thông tin shop để tránh lỗi null
        if (!$seller->shop) {
            return response()->json(['message' => 'Tài khoản người bán không có cửa hàng.'], 403);
        }


        $validator = Validator::make($request->all(), [
            'action' => 'required|in:approve,reject',
            'seller_note' => 'nullable|string|max:1000',
        ]);


        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }


        // 2. Sử dụng Transaction để đảm bảo toàn vẹn dữ liệu
        DB::beginTransaction();
        try {
            // Nạp các quan hệ cần thiết. Không cần nạp shippingAddress nữa.
            $returnRequest = ReturnRequest::with(['orderBuyer', 'orderItem', 'user'])
                ->where('ReturnRequestID', $id)
                ->where('ShopID', $seller->shop->ShopID)
                ->lockForUpdate()
                ->firstOrFail();


            // Kiểm tra trạng thái hợp lệ
            if ($returnRequest->Status !== 'PendingSellerApproval') {
                DB::rollBack();
                return response()->json(['message' => 'Yêu cầu này đã được xử lý trước đó.'], 409);
            }
           
            $action = $request->input('action');
           
            // 3. Xử lý logic dựa trên hành động
            if ($action === 'approve') {
                $returnRequest->SellerNote = $request->input('seller_note', 'Yêu cầu được chấp thuận.');


                // Phân loại logic dựa trên loại yêu cầu
                if ($returnRequest->RequestType === 'Return') {
                    // ============ LOGIC TRẢ HÀNG VÀ GỬI WEBHOOK ============
                    $returnRequest->Status = 'SellerApproved_WaitForReturn';


                    // Lấy thông tin địa chỉ từ cột JSON (đã được cast thành array)
                    $shippingInfo = $returnRequest->BuyerShippingInfoForReturn;


                    // XÂY DỰNG PAYLOAD CHÍNH XÁC
                    $payload = [
                        'order_id'      => $returnRequest->RequestCode,
                        'seller'        => $seller->shop->ShopName,
                        'sellerPhone'   => $seller->shop->ShopPhone,
                        'address'       => $shippingInfo['address_line'] ?? 'Không có địa chỉ',
                    ];


                    // GỌI WEBHOOK TRỰC TIẾP
                    try {
                        (new WebhookService())->sendWebhook($payload);
                    } catch (\Exception $e) {
                        Log::error("Gửi webhook TRỰC TIẾP thất bại cho yêu cầu {$payload['order_id']}: " . $e->getMessage());
                    }


                } elseif ($returnRequest->RequestType === 'Refund') {
                    // ============ LOGIC HOÀN TIỀN ============
                    $paymentMethod = $returnRequest->orderBuyer->PaymentMethod;
                    if ($paymentMethod === 'VNPay') {
                        $returnRequest->Status = 'Approved_ProcessingVnpayRefund';
                    } else {
                        $returnRequest->Status = 'Approved_WaitForBankTransfer';
                    }
                }
               
                $returnRequest->orderItem->update(['ReturnStatus' => 'Approved']);


            } else { // action === 'reject'
                $returnRequest->Status = 'SellerRejected';
                $returnRequest->SellerNote = $request->input('seller_note', 'Yêu cầu bị từ chối.');
                $returnRequest->orderItem->update(['ReturnStatus' => 'Rejected']);
            }


            $returnRequest->save();
           
            // 4. Kích hoạt job hoàn tiền tự động (nếu có)
            if ($action === 'approve' && $returnRequest->Status === 'Approved_ProcessingVnpayRefund') {
                ProcessVnpayRefund::dispatch($returnRequest)->afterCommit();
            }


            DB::commit();


            // 5. Trả về phản hồi thành công
            return response()->json([
                'message' => 'Phản hồi yêu cầu thành công!',
                'data' => $returnRequest->fresh(['orderBuyer', 'orderItem'])
            ]);


        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Lỗi khi seller xử lý yêu cầu trả hàng #{$id}: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Đã có lỗi xảy ra phía máy chủ.'], 500);
        }
    }
           public function confirmReceipt(Request $request, $id)
    {
        $seller = Auth::user();
        if (!$seller->shop) {
            return response()->json(['message' => 'Tài khoản người bán không có cửa hàng.'], 403);
        }


        DB::beginTransaction();
        try {
            $returnRequest = ReturnRequest::where('ReturnRequestID', $id)
                ->where('ShopID', $seller->shop->ShopID)
                ->lockForUpdate()
                ->first();


            if (!$returnRequest) {
                DB::rollBack();
                return response()->json(['message' => 'Không tìm thấy yêu cầu.'], 404);
            }


            // Chỉ cho phép hành động này khi trạng thái là "Chờ người mua gửi hàng"
            if ($returnRequest->Status !== 'SellerApproved_WaitForReturn') {
                DB::rollBack();
                return response()->json(['message' => 'Yêu cầu không ở trạng thái hợp lệ để xác nhận nhận hàng.'], 409);
            }


            // Chuyển sang bước tiếp theo: Hoàn tiền
            if ($returnRequest->RefundMethod === 'VNPAY') {
                $returnRequest->Status = 'Approved_ProcessingVnpayRefund';
            } else { // BankTransfer
                $returnRequest->Status = 'Approved_WaitForBankTransfer';
            }
           
            $returnRequest->save();


            // Kích hoạt Job hoàn tiền VNPAY nếu cần
            if ($returnRequest->Status === 'Approved_ProcessingVnpayRefund') {
                ProcessVnpayRefund::dispatch($returnRequest);
                Log::info("Đã đẩy yêu cầu hoàn tiền VNPay #{$returnRequest->ReturnRequestID} vào hàng đợi sau khi xác nhận nhận hàng.");
            }


            DB::commit();


            return response()->json([
                'message' => 'Xác nhận đã nhận hàng thành công! Yêu cầu đã được chuyển sang bước hoàn tiền.',
                'data' => $returnRequest->fresh(['user', 'order', 'orderItem.variant.product'])
            ]);


        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Lỗi khi seller xác nhận nhận hàng cho yêu cầu #{$id}: " . $e->getMessage());
            return response()->json(['message' => 'Đã có lỗi xảy ra phía máy chủ.'], 500);
        }
    }


    // ====================================================================
    // [API MỚI] XỬ LÝ KHI NGƯỜI BÁN XÁC NHẬN ĐÃ CHUYỂN KHOẢN
    // ====================================================================
    public function confirmBankTransfer(Request $request, $id)
    {
        $seller = Auth::user();
        if (!$seller->shop) {
            return response()->json(['message' => 'Tài khoản người bán không có cửa hàng.'], 403);
        }$validator = Validator::make($request->all(), [
            'transaction_note' => 'nullable|string|max:500',
        ]);


        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }


        DB::beginTransaction();
        try {
            $returnRequest = ReturnRequest::where('ReturnRequestID', $id)
                ->where('ShopID', $seller->shop->ShopID)
                ->lockForUpdate()
                ->first();


            if (!$returnRequest) {
                DB::rollBack();
                return response()->json(['message' => 'Không tìm thấy yêu cầu.'], 404);
            }


            // Cho phép hành động này khi "Chờ chuyển khoản" hoặc "Hoàn tiền thất bại"
            $allowedStatuses = ['Approved_WaitForBankTransfer', 'RefundProcessingFailed'];
            if (!in_array($returnRequest->Status, $allowedStatuses)) {
                DB::rollBack();
                return response()->json(['message' => 'Yêu cầu không ở trạng thái hợp lệ để xác nhận chuyển khoản.'], 409);
            }


            // Cập nhật trạng thái và ghi chú
            $returnRequest->Status = 'Refunded';
            $returnRequest->SellerNote = $request->input('transaction_note', 'Người bán đã xác nhận chuyển khoản thủ công.');
            $returnRequest->ResolvedAt = now(); // Cập nhật thời gian hoàn tất
            $returnRequest->save();


            // Cập nhật trạng thái của OrderItem
            if ($returnRequest->orderItem) {
                $returnRequest->orderItem->ReturnStatus = 'Refunded';
                $returnRequest->orderItem->save();
            }


            // Optional: Update Order's OverallStatus if all items are resolved.
            // This logic can be complex and might be better handled by a separate service.


            DB::commit();


            return response()->json([
                'message' => 'Xác nhận chuyển khoản thành công! Yêu cầu đã được hoàn tất.',
                'data' => $returnRequest->fresh(['user', 'order', 'orderItem.variant.product'])
            ]);


        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Lỗi khi seller xác nhận chuyển khoản cho yêu cầu #{$id}: " . $e->getMessage());
            return response()->json(['message' => 'Đã có lỗi xảy ra phía máy chủ.'], 500);
        }
    }
}
