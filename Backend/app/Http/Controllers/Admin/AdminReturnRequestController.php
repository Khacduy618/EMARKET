<?php


namespace App\Http\Controllers\Admin;


use App\Http\Controllers\Controller;
use App\Models\ReturnRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail; // << THÊM DÒNG NÀY (chuẩn bị cho mail)
use App\Mail\SellerRefundConfirmationMail;
use Illuminate\Database\Eloquent\ModelNotFoundException;
class AdminReturnRequestController extends Controller
{
    /**
     * [ADMIN-READ] Lấy danh sách các yêu cầu đang chờ Admin xử lý hoàn tiền.
     */
    public function listPendingRefunds(Request $request)
    {
        // Bước 1 & 2: Kiểm tra quyền Admin (Giữ nguyên)
        $user = Auth::user();
        if (!$user || $user->Role !== 'Admin') {
            return response()->json([
                'message' => 'Forbidden: You do not have permission to access this resource.'
            ], 403);
        }
       
        // ---- Logic chính ----


        // Bước 3: Lọc các yêu cầu có trạng thái "Đã duyệt, chờ Admin xử lý"
        // Luồng mới của chúng ta chỉ cần lọc trạng thái 'Approved_WaitForAdmin'
        $query = ReturnRequest::where('Status', 'Approved_WaitForAdmin')
            ->with([
                'user:UserID,FullName',
                'shop:ShopID,ShopName',
                'orderItem:OrderItemID,PriceAtPurchase,Quantity',
            ]);


        // Thêm bộ lọc nếu cần
        if ($request->has('shop_id')) {
            $query->where('ShopID', $request->shop_id);
        }


        // Bước 4 & 5: Lấy dữ liệu và trả về (Giữ nguyên)
        $pendingRequests = $query->orderBy('LastUpdatedAt', 'asc')->paginate(20);
        return response()->json($pendingRequests);
    }


    /**
     * [ADMIN-READ] Lấy thông tin chi tiết của một yêu cầu.
     */
    public function show($id)
    {
        // Hàm này giữ nguyên, không cần thay đổi
        $returnRequest = ReturnRequest::with([
            'user:UserID,FullName,Phone',
            'shop:ShopID,ShopName,ShopPhone', // Quan trọng: cần có ShopPhone, ShopEmail...
            'orderBuyer:OrderID,OrderCode,PaymentMethod',
            'orderItem.variant.product'
        ])->findOrFail($id);
       
        return response()->json($returnRequest);
    }


    /**
     * [ADMIN-WRITE] Admin xác nhận đã chuyển khoản hoàn tiền thủ công cho Buyer.
     * Đây là hàm DUY NHẤT để xác nhận, đã được nâng cấp.
     */
     public function confirmBankTransfer(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'admin_note'   => 'required|string|max:1000',
            'refund_proof' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }


        try {
            $result = DB::transaction(function () use ($request, $id) {
                // 2. Tải yêu cầu và các quan hệ cần thiết
                $returnRequest = ReturnRequest::with([
                    'orderItem.sellerOrder',
                    'shop.user', // << THAY ĐỔI 1: Tải sẵn user của shop
                    'user'
                ])
                    ->lockForUpdate()
                    ->findOrFail($id);


                // ... các bước cập nhật trạng thái giữ nguyên ...
                $allowedStatuses = ['Approved_WaitForAdmin', 'Approved_WaitForBankTransfer'];
                if (!in_array($returnRequest->Status, $allowedStatuses)) {
                    throw new \Exception('Yêu cầu không ở trạng thái hợp lệ để xác nhận chuyển khoản.', 409);
                }
               
                $proofPath = null;
                if ($request->hasFile('refund_proof')) {
                    $proofPath = $request->file('refund_proof')->store('refund_proofs', 'public');
                }


                $returnRequest->Status = 'Refunded';
                $returnRequest->AdminNote = $request->input('admin_note');
                $returnRequest->RefundTransactionProof = $proofPath;
                $returnRequest->ResolvedAt = now();
                $returnRequest->save();


                if ($returnRequest->orderItem) {
                    $returnRequest->orderItem->ReturnStatus = 'Refunded';
                    $returnRequest->orderItem->save();
                    if($returnRequest->orderItem->sellerOrder) {
                        $returnRequest->orderItem->sellerOrder->Status = 'Returned';
                        $returnRequest->orderItem->sellerOrder->save();
                    }
                }


                // ====================================================================
                // << THAY ĐỔI 2: Lấy email từ user của shop >>
                // ====================================================================
                Log::info("Bắt đầu quy trình gửi email thông báo cho Yêu cầu #{$returnRequest->ReturnRequestID}");
               
                // Kiểm tra xem shop có tồn tại, user của shop có tồn tại và user đó có email hay không
                if ($returnRequest->shop && $returnRequest->shop->user && !empty($returnRequest->shop->user->Email)) {
                    $shopOwnerEmail = $returnRequest->shop->user->Email;
                   
                    Log::info("Tìm thấy email của chủ shop: {$shopOwnerEmail}. Đang tiến hành gửi mail...");
                   
                    Mail::to($shopOwnerEmail)->send(new SellerRefundConfirmationMail($returnRequest));
                   
                    Log::info("Đã đẩy email vào hàng đợi cho Yêu cầu #{$returnRequest->ReturnRequestID}");
                } else {
                    $shopId = $returnRequest->shop ? $returnRequest->shop->ShopID : 'N/A';
                    Log::warning("Không thể gửi email cho Yêu cầu #{$returnRequest->ReturnRequestID} vì User liên kết với ShopID #{$shopId} không tồn tại hoặc không có địa chỉ email.");
                }
                // ====================================================================


                return $returnRequest;
            });


            return response()->json([
                'message' => 'Xác nhận hoàn tiền thành công! Yêu cầu đã được hoàn tất.',
                'data' => $result
            ]);


        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Không tìm thấy yêu cầu.'], 404);
        } catch (\Exception $e) {
            Log::error("Lỗi khi Admin xác nhận chuyển khoản cho yêu cầu #{$id}: " . $e->getMessage());
            $statusCode = is_int($e->getCode()) && $e->getCode() >= 400 ? $e->getCode() : 500;
            return response()->json(['message' => $e->getMessage() ?: 'Đã có lỗi xảy ra phía máy chủ.'], $statusCode);
        }
    }
}
