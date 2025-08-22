<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ReturnRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class AdminReturnRequestController extends Controller
{
    /**
     * [ADMIN-READ] Lấy danh sách các yêu cầu đang chờ Admin xử lý hoàn tiền.
     */
      public function listPendingRefunds(Request $request)
    {
        // Bước 1: Lấy thông tin người dùng đang đăng nhập
        $user = Auth::user();

        // Bước 2: Kiểm tra quyền Admin
        // Nếu người dùng chưa đăng nhập hoặc vai trò không phải là 'Admin'
        if (!$user || $user->Role !== 'Admin') {
            // Từ chối truy cập ngay lập tức
            return response()->json([
                'message' => 'Forbidden: You do not have permission to access this resource.'
            ], 403);
        }
        
        // ---- Logic chính của hàm chỉ chạy khi người dùng là Admin ----

        // Bước 3: Lọc các yêu cầu có trạng thái "Đã duyệt, chờ Admin xử lý"
        $query = ReturnRequest::where('Status', 'Approved_WaitForAdmin')
            ->with([
                'user:UserID,FullName',
                'shop:ShopID,ShopName',
                'orderItem:OrderItemID,PriceAtPurchase,Quantity',
            ]);

        // Thêm bộ lọc nếu cần (ví dụ: lọc theo shop, theo ngày...)
        if ($request->has('shop_id')) {
            $query->where('ShopID', $request->shop_id);
        }

        // Bước 4: Lấy dữ liệu và phân trang
        $pendingRequests = $query->orderBy('LastUpdatedAt', 'asc')->paginate(20);

        // Bước 5: Trả về kết quả
        return response()->json($pendingRequests);
    }

    /**
     * [ADMIN-READ] Lấy thông tin chi tiết của một yêu cầu.
     */
    public function show($id)
    {
        $returnRequest = ReturnRequest::with([
            'user:UserID,FullName,Phone',
            'shop:ShopID,ShopName,ShopPhone',
            'orderBuyer:OrderID,OrderCode,PaymentMethod',
            'orderItem.variant.product'
        ])->findOrFail($id);

        // Định dạng lại thông tin hoàn tiền cho dễ dùng ở frontend
        $responseData = $returnRequest->toArray();
        if ($returnRequest->RefundMethod === 'BankTransfer') {
            $responseData['refund_details'] = [
                'method' => 'Chuyển khoản Ngân hàng (COD)',
                'bank_name' => $returnRequest->RefundBankName,
                'account_number' => $returnRequest->RefundAccountNumber,
                'account_holder_name' => $returnRequest->RefundAccountHolderName,
            ];
        }
        // Thêm logic cho VNPAY nếu cần
        
        return response()->json($responseData);
    }

    /**
     * [ADMIN-WRITE] Admin xác nhận đã chuyển khoản hoàn tiền thủ công cho Buyer.
     */
    public function confirmBankTransfer(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'admin_note' => 'required|string|max:1000', // Admin bắt buộc phải ghi chú
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $result = DB::transaction(function () use ($request, $id) {
                $returnRequest = ReturnRequest::with(['orderItem'])
                    ->lockForUpdate()
                    ->findOrFail($id);

                // Chỉ cho phép xác nhận khi đang ở trạng thái chờ Admin xử lý
                if ($returnRequest->Status !== 'Approved_WaitForAdmin') {
                    throw new \Exception('Yêu cầu không ở trạng thái hợp lệ để xác nhận chuyển khoản.', 409);
                }

                // Cập nhật trạng thái và ghi chú của Admin
                $returnRequest->Status = 'Refunded';
                $returnRequest->AdminNote = $request->input('admin_note');
                $returnRequest->ResolvedAt = now();
                $returnRequest->save();

                // Cập nhật các bảng liên quan
                if ($returnRequest->orderItem) {
                    $returnRequest->orderItem->ReturnStatus = 'Refunded';
                    $returnRequest->orderItem->save();
                    // Cập nhật seller order nếu cần
                    $returnRequest->orderItem->sellerOrder->Status = 'Completed'; // hoặc 'Returned'
                    $returnRequest->orderItem->sellerOrder->save();
                }

                return $returnRequest;
            });

             return response()->json([
                'message' => 'Xác nhận hoàn tiền thành công! Yêu cầu đã được hoàn tất.',
                'data' => $result
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Không tìm thấy yêu cầu.'], 404);
        } catch (\Exception $e) {
            Log::error("Lỗi khi Admin xác nhận chuyển khoản cho yêu cầu #{$id}: " . $e->getMessage());
            $statusCode = is_int($e->getCode()) && $e->getCode() >= 400 ? $e->getCode() : 500;
            return response()->json(['message' => $e->getMessage() ?: 'Đã có lỗi xảy ra phía máy chủ.'], $statusCode);
        }
    }
}