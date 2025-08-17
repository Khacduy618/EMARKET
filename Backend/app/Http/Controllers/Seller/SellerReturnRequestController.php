<?php

// namespace App\Http\Controllers\Seller;

// // 1. Chỉ cần kế thừa Controller cơ bản
// use App\Http\Controllers\Controller;
// use App\Models\ReturnRequest;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Auth;
// use Illuminate\Support\Facades\DB;
// use Illuminate\Support\Facades\Log;
// use Illuminate\Support\Facades\Validator;

// class SellerReturnRequestController extends Controller
// {
//     /**
//      * [SELLER-READ] Lấy danh sách các yêu cầu trả hàng cho shop của người bán.
//      */
//     public function index(Request $request)
//     {
//         // ... (Không có thay đổi ở hàm này) ...
//         $seller = Auth::user();
//         if (!$seller->shop) {
//         // Nếu user này không có shop, trả về lỗi rõ ràng thay vì crash
//         return response()->json([
//             'message' => 'Tài khoản người bán này không được liên kết với bất kỳ cửa hàng nào.'
//         ], 403); // 403 Forbidden là một lựa chọn tốt
//     }

//     $shopId = $seller->shop->ShopID;


//         $query = ReturnRequest::where('ShopID', $shopId);

//         if ($request->has('status') && !empty($request->status)) {
//             $query->where('Status', $request->status);
//         }

//         $requests = $query->with([
//             'user:UserID,FullName',
//             'order:OrderID,OrderCode,PaymentMethod',
//             'orderItem.product:ProductID,Name,ProductImageURL'
//         ])
//         ->orderBy('RequestedAt', 'desc')
//         ->paginate(15);

//         return response()->json($requests);
//     }

//     /**
//      * [SELLER-READ] Lấy thông tin chi tiết của một yêu cầu.
//      */
//     public function show($id) // Quay lại dùng $id
//     {
//         $seller = Auth::user();
        
//         // 2. Tìm và kiểm tra quyền sở hữu thủ công
//         $returnRequest = ReturnRequest::where('ReturnRequestID', $id)
//                                       ->where('ShopID', $seller->shop->ShopID) // Đảm bảo yêu cầu thuộc shop của họ
//                                       ->with(['user:UserID,FullName,Phone', 'order', 'orderItem.variant.product'])
//                                       ->first();

//         // Nếu không tìm thấy hoặc không thuộc shop, trả về 404
//         if (!$returnRequest) {
//             return response()->json(['message' => 'Không tìm thấy yêu cầu.'], 404);
//         }

//         return response()->json($returnRequest);
//     }

//     /**
//      * [SELLER-UPDATE] Phản hồi yêu cầu (Duyệt/Từ chối).
//      */
//     public function respond(Request $request, $id)
//     {
//         $seller = Auth::user();
//         if (!$seller->shop) {
//             return response()->json(['message' => 'Tài khoản người bán không có cửa hàng.'], 403);
//         }

//         $validator = Validator::make($request->all(), [
//             'action' => 'required|in:approve,reject',
//             'seller_note' => 'nullable|string|max:1000',
//         ]);

//         if ($validator->fails()) {
//             return response()->json(['errors' => $validator->errors()], 422);
//         }

//         // Use a database transaction to ensure data integrity
//         DB::beginTransaction();
//         try {
//             // Find the request and lock it for update to prevent race conditions
//             $returnRequest = ReturnRequest::with('order', 'orderItem')
//                 ->where('ReturnRequestID', $id)
//                 ->where('ShopID', $seller->shop->ShopID)
//                 ->lockForUpdate() // Prevents other processes from modifying this row
//                 ->first();

//             if (!$returnRequest) {
//                 DB::rollBack();
//                 return response()->json(['message' => 'Không tìm thấy yêu cầu.'], 404);
//             }

//             if ($returnRequest->Status !== 'PendingSellerApproval') {
//                 DB::rollBack();
//                 return response()->json(['message' => 'Yêu cầu này đã được xử lý trước đó.'], 409); // 409 Conflict
//             }
            
//             $action = $request->input('action');
//             $sellerNote = $request->input('seller_note');

//             if ($action === 'approve') {
//                 $returnRequest->SellerNote = $sellerNote ?? 'Yêu cầu được chấp thuận.';

//                 // CASE 1: Request type is "Return" (trả hàng)
//                 if ($returnRequest->RequestType === 'Return') {
//                     $returnRequest->Status = 'SellerApproved_WaitForReturn';
//                 } 
//                 // CASE 2 & 3: Request type is "Refund" (hoàn tiền không trả hàng)
//                 elseif ($returnRequest->RequestType === 'Refund') {
//                     $paymentMethod = $returnRequest->order->PaymentMethod;

//                     if ($paymentMethod === 'VNPay') {
//                         // CASE 2: Refund for VNPay order
//                         $returnRequest->Status = 'Approved_ProcessingVnpayRefund';
//                     } else { // COD or other methods
//                         // CASE 3: Refund for COD order
//                         $returnRequest->Status = 'Approved_WaitForBankTransfer';
//                     }
//                 }
                
//                 // Update the related OrderItem status
//                 if ($returnRequest->orderItem) {
//                     $returnRequest->orderItem->ReturnStatus = 'Approved';
//                     $returnRequest->orderItem->save();
//                 }

//             } else { // action === 'reject'
//                 $returnRequest->Status = 'SellerRejected';
//                 $returnRequest->SellerNote = $sellerNote ?? 'Yêu cầu bị từ chối.';
                
//                  // Update the related OrderItem status
//                 if ($returnRequest->orderItem) {
//                     $returnRequest->orderItem->ReturnStatus = 'Rejected';
//                     $returnRequest->orderItem->save();
//                 }
//             }

//             $returnRequest->save();
//             DB::commit();

//             return response()->json([
//                 'message' => 'Phản hồi yêu cầu thành công!',
//                 'data' => $returnRequest->fresh(['order', 'orderItem'])
//             ]);

//         } catch (\Exception $e) {
//             DB::rollBack();
//             Log::error('Lỗi khi seller xử lý yêu cầu trả hàng #' . $id . ': ' . $e->getMessage());
//             return response()->json(['message' => 'Đã có lỗi xảy ra phía máy chủ, vui lòng thử lại.'], 500);
//         }
//     }
// }

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

class SellerReturnRequestController extends Controller
{
    /**
     * [SELLER-READ] Lấy danh sách các yêu cầu trả hàng cho shop của người bán.
     */
    public function index(Request $request)
    {
        $seller = Auth::user();
        if (!$seller->shop) {
            return response()->json(['message' => 'Tài khoản người bán này không được liên kết với bất kỳ cửa hàng nào.'], 403);
        }

        $shopId = $seller->shop->ShopID;

        // Tải trước các quan hệ (eager load) để tăng hiệu suất
        $query = ReturnRequest::where('ShopID', $shopId)
            ->with([
                'user:UserID,FullName',
                'order:OrderID,OrderCode,TotalAmount,PaymentMethod',
                'orderItem.variant.product:ProductID,Name' // Tải thông tin sản phẩm cần thiết
            ]);

        if ($request->has('status') && !empty($request->status)) {
            $query->where('Status', $request->status);
        }

        $requests = $query->orderBy('RequestedAt', 'desc')->paginate(15);

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
 
    public function respond(Request $request, $id)
    {
        // 1. Xác thực người dùng và dữ liệu đầu vào
        $seller = Auth::user();
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
            // Lấy yêu cầu và khóa dòng dữ liệu để tránh xung đột
            $returnRequest = ReturnRequest::with('order', 'orderItem')
                ->where('ReturnRequestID', $id)
                ->where('ShopID', $seller->shop->ShopID)
                ->lockForUpdate()
                ->first();

            // Kiểm tra sự tồn tại và trạng thái của yêu cầu
            if (!$returnRequest) {
                DB::rollBack();
                return response()->json(['message' => 'Không tìm thấy yêu cầu.'], 404);
            }

            if ($returnRequest->Status !== 'PendingSellerApproval') {
                DB::rollBack();
                return response()->json(['message' => 'Yêu cầu này đã được xử lý trước đó.'], 409);
            }
            
            $action = $request->input('action');
            $sellerNote = $request->input('seller_note');
            
            // 3. Xử lý logic dựa trên hành động 'approve' hoặc 'reject'
            if ($action === 'approve') {
                $returnRequest->SellerNote = $sellerNote ?? 'Yêu cầu được chấp thuận.';

                // Phân loại logic dựa trên loại yêu cầu (Trả hàng hay Hoàn tiền)
                if ($returnRequest->RequestType === 'Return') {
                    $returnRequest->Status = 'SellerApproved_WaitForReturn'; // Chờ người mua gửi hàng
                } 
                elseif ($returnRequest->RequestType === 'Refund') {
                    $paymentMethod = $returnRequest->order->PaymentMethod;
                    if ($paymentMethod === 'VNPay') {
                        $returnRequest->Status = 'Approved_ProcessingVnpayRefund'; // Sẵn sàng để hệ thống tự động hoàn tiền
                    } else {
                        $returnRequest->Status = 'Approved_WaitForBankTransfer'; // Cần người bán tự chuyển khoản
                    }
                }
                
                // Cập nhật trạng thái của item trong đơn hàng
                if ($returnRequest->orderItem) {
                    $returnRequest->orderItem->ReturnStatus = 'Approved';
                    $returnRequest->orderItem->save();
                }

            } else { // action === 'reject'
                $returnRequest->Status = 'SellerRejected';
                $returnRequest->SellerNote = $sellerNote ?? 'Yêu cầu bị từ chối.';
                
                if ($returnRequest->orderItem) {
                    $returnRequest->orderItem->ReturnStatus = 'Rejected';
                    $returnRequest->orderItem->save();
                }
            }

            // Lưu thay đổi vào CSDL
            $returnRequest->save();
            
            // 4. Kích hoạt quy trình tự động nếu cần
            // Sau khi đã lưu trạng thái mới, kiểm tra nếu cần đẩy Job vào Queue
            if ($action === 'approve' && $returnRequest->Status === 'Approved_ProcessingVnpayRefund') {
                // Gửi công việc xử lý hoàn tiền VNPay vào hàng đợi để chạy nền
                ProcessVnpayRefund::dispatch($returnRequest);
                Log::info("Đã đẩy yêu cầu hoàn tiền VNPay #{$returnRequest->ReturnRequestID} vào hàng đợi.");
            }

            // Hoàn tất transaction
            DB::commit();

            // 5. Trả về phản hồi thành công cho người bán
            return response()->json([
                'message' => 'Phản hồi yêu cầu thành công! Yêu cầu hoàn tiền (nếu có) sẽ được hệ thống tự động xử lý.',
                'data' => $returnRequest->fresh(['order', 'orderItem']) // Lấy dữ liệu mới nhất
            ]);

        } catch (\Exception $e) {
            // Nếu có lỗi, rollback transaction và ghi log
            DB::rollBack();
            Log::error("Lỗi khi seller xử lý yêu cầu trả hàng #{$id}: " . $e->getMessage());
            return response()->json(['message' => 'Đã có lỗi xảy ra phía máy chủ, vui lòng thử lại.'], 500);
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
        }

        $validator = Validator::make($request->all(), [
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