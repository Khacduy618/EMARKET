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
use App\Services\WebhookService;
use Illuminate\Database\Eloquent\ModelNotFoundException; // Import để bắt lỗi


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


        $query = ReturnRequest::where('ShopID', $shopId)
            ->with([
                'user:UserID,FullName,Avatar',
                'orderBuyer:OrderID,OrderCode',
                'orderItem' => function ($query) {
                    $query->select('OrderItemID', 'VariantID', 'Quantity', 'PriceAtPurchase')
                          ->with([
                                'variant:VariantID,ProductID,Sku,ImageURL',
                                'variant.product:ProductID,Name'
                           ]);
                },
                'sellerOrder:SellerOrderID,SellerOrderCode'
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


        try {
            $returnRequest = ReturnRequest::where('ReturnRequestID', $id)
                ->where('ShopID', $seller->shop->ShopID)
                ->with([
                    'user:UserID,FullName,Phone',
                    'orderBuyer.shippingAddress', // Tải thông tin địa chỉ qua đơn hàng tổng
                    'orderItem.variant.product',
                    'orderItem.variant.attributes.attribute'
                ])
                ->firstOrFail();


            return response()->json($returnRequest);


        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Không tìm thấy yêu cầu.'], 404);
        }
    }
 
    /**
     * [SELLER-WRITE] Seller phản hồi (chấp nhận/từ chối) yêu cầu.
     */
    public function respond(Request $request, $id)
    {
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


        DB::beginTransaction();
        try {
            $returnRequest = ReturnRequest::with(['orderBuyer', 'orderItem', 'user'])
                ->where('ReturnRequestID', $id)
                ->where('ShopID', $seller->shop->ShopID)
                ->lockForUpdate()
                ->firstOrFail();


            if ($returnRequest->Status !== 'PendingSellerApproval') {
                DB::rollBack();
                return response()->json(['message' => 'Yêu cầu này đã được xử lý trước đó.'], 409);
            }
           
            $action = $request->input('action');
           
            if ($action === 'approve') {
                $returnRequest->SellerNote = $request->input('seller_note', 'Yêu cầu được chấp thuận.');


                if ($returnRequest->RequestType === 'Return') {
                    $returnRequest->Status = 'SellerApproved_WaitForReturn';


                    // Logic gửi webhook (nếu có)
                    // ...
                   
                } elseif ($returnRequest->RequestType === 'Refund') {
                    $paymentMethod = $returnRequest->orderBuyer->PaymentMethod;
                    if ($paymentMethod === 'VNPay') {
                        $returnRequest->Status = 'Approved_ProcessingVnpayRefund';
                    } else {
                        // CHUYỂN THẲNG SANG CHỜ ADMIN XỬ LÝ
                        $returnRequest->Status = 'Approved_WaitForAdmin';
                    }
                }
               
                $returnRequest->orderItem->update(['ReturnStatus' => 'Approved']);


            } else { // action === 'reject'
                $returnRequest->Status = 'SellerRejected';
                $returnRequest->SellerNote = $request->input('seller_note', 'Yêu cầu bị từ chối.');
                $returnRequest->orderItem->update(['ReturnStatus' => 'Rejected']);
            }


            $returnRequest->save();
           
            if ($action === 'approve' && $returnRequest->Status === 'Approved_ProcessingVnpayRefund') {
                ProcessVnpayRefund::dispatch($returnRequest)->afterCommit();
            }


            DB::commit();


            return response()->json([
                'message' => 'Phản hồi yêu cầu thành công!',
                'data' => $returnRequest->fresh(['orderBuyer', 'orderItem'])
            ]);


        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json(['message' => 'Không tìm thấy yêu cầu.'], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Lỗi khi seller xử lý yêu cầu trả hàng #{$id}: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Đã có lỗi xảy ra phía máy chủ.'], 500);
        }
    }
   
    /**
     * [SELLER-WRITE] Seller xác nhận đã nhận được hàng trả về từ người mua.
     */
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
                ->firstOrFail();


            if ($returnRequest->Status !== 'SellerApproved_WaitForReturn') {
                DB::rollBack();
                return response()->json(['message' => 'Yêu cầu không ở trạng thái hợp lệ để xác nhận nhận hàng.'], 409);
            }


            // Phân loại bước tiếp theo dựa trên phương thức hoàn tiền
            if ($returnRequest->RefundMethod === 'VNPAY') {
                $returnRequest->Status = 'Approved_ProcessingVnpayRefund';
            } else { // BankTransfer / COD
                // **SỬA ĐỔI QUAN TRỌNG:** Chuyển sang chờ Admin xử lý
                $returnRequest->Status = 'Approved_WaitForAdmin';
            }
           
            $returnRequest->save();


            if ($returnRequest->Status === 'Approved_ProcessingVnpayRefund') {
                ProcessVnpayRefund::dispatch($returnRequest)->afterCommit();
                Log::info("Đã đẩy yêu cầu hoàn tiền VNPay #{$returnRequest->ReturnRequestID} vào hàng đợi sau khi xác nhận nhận hàng.");
            }


            DB::commit();


            return response()->json([
                'message' => 'Xác nhận đã nhận hàng thành công! Yêu cầu đã được chuyển đến Admin để xử lý hoàn tiền.',
                'data' => $returnRequest->fresh(['user', 'orderBuyer', 'orderItem.variant.product'])
            ]);


        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json(['message' => 'Không tìm thấy yêu cầu.'], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Lỗi khi seller xác nhận nhận hàng cho yêu cầu #{$id}: " . $e->getMessage());
            return response()->json(['message' => 'Đã có lỗi xảy ra phía máy chủ.'], 500);
        }
    }


    // Hàm `confirmBankTransfer()` đã được xóa hoàn toàn vì Seller không còn thực hiện hành động này.


}
