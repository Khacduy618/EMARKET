<?php 

namespace App\Http\Controllers;


use App\Http\Controllers\Controller;
use App\Models\OrderBuyer;
use App\Models\SellerOrder;
use App\Models\ReturnRequest;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;


class ReturnRequestController extends Controller
{
    /**
     * Người mua tạo yêu cầu Trả hàng/Hoàn tiền.
     */
    public function createRequest(Request $request)
    {
        $user = Auth::user();


        // 1. VALIDATION
        $validator = Validator::make($request->all(), [
            'order_item_id'       => 'required|integer|exists:orderitems,OrderItemID',
            'request_type'        => 'required|in:Return,Refund',
            'reason_description'  => 'required|string|max:1000',
            'evidence_images'     => 'nullable|array|max:5',
            'evidence_images.*'   => 'image|mimes:jpeg,png,jpg|max:5120',
            'buyer_return_address'              => 'required_if:request_type,Return|array',
            'buyer_return_address.full_name'    => 'required_if:request_type,Return|string|max:255',
            'buyer_return_address.phone_number' => 'required_if:request_type,Return|string|max:20',
            'buyer_return_address.address_line' => 'required_if:request_type,Return|string|max:1000',
            'refund_account_info'                     => 'nullable|array',
            'refund_account_info.bank_name'           => 'required_with:refund_account_info|string|max:255',
            'refund_account_info.account_number'      => 'required_with:refund_account_info|string|max:50',
            'refund_account_info.account_holder_name' => 'required_with:refund_account_info|string|max:255',
        ]);


        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }


        try {
            $returnRequest = DB::transaction(function () use ($request, $user) {
                $orderItemId = $request->input('order_item_id');


                // 2. LẤY DỮ LIỆU VÀ KIỂM TRA ĐIỀU KIỆN
                $orderItem = OrderItem::with(['sellerOrder.orderBuyer'])
                    ->where('OrderItemID', $orderItemId)
                    ->whereHas('sellerOrder.orderBuyer', function ($query) use ($user) {
                        $query->where('UserID', $user->UserID);
                    })
                    ->firstOrFail();


                $mainOrder = $orderItem->sellerOrder->orderBuyer;
                $sellerOrder = $orderItem->sellerOrder;


                if (!in_array($sellerOrder->Status, ['Delivered', 'Completed'])) {
                    throw new \Exception('Bạn chỉ có thể tạo yêu cầu sau khi đơn hàng của shop này đã được giao thành công.', 400);
                }
                if (empty($sellerOrder->DeliveredAt) || Carbon::parse($sellerOrder->DeliveredAt)->addDays(3)->isPast()) {
                    throw new \Exception('Đã quá 3 ngày kể từ khi đơn hàng được giao, bạn không thể tạo yêu cầu.', 403);
                }
                if (ReturnRequest::where('OrderItemID', $orderItemId)->exists()) {
                    throw new \Exception('Bạn đã tạo yêu cầu cho sản phẩm này rồi.', 409);
                }


                // 3. XỬ LÝ UPLOAD FILE ẢNH
                $evidenceUrls = [];
                if ($request->hasFile('evidence_images')) {
                    foreach ($request->file('evidence_images') as $image) {
                        $path = $image->store('return_requests/evidence', 'public');
                        $evidenceUrls[] = Storage::url($path);
                    }
                }


                // 4. CHUẨN BỊ DỮ LIỆU ĐỂ TẠO REQUEST
                $dataToCreate = [
                    'OrderID'           => $mainOrder->OrderID,
                    'SellerOrderID'     => $sellerOrder->SellerOrderID,
                    'OrderItemID'       => $orderItem->OrderItemID,
                    'UserID'            => $user->UserID,
                    'ShopID'            => $sellerOrder->ShopID,
                    'RequestCode'       => 'RR-' . strtoupper(uniqid()),
                    'RequestType'       => $request->input('request_type'),
                    'ReasonDescription' => $request->input('reason_description'),
                    'EvidenceURLs'      => count($evidenceUrls) > 0 ? json_encode($evidenceUrls) : null,
                    'Status'            => 'PendingSellerApproval',
                    'RefundAmount'      => $orderItem->PriceAtPurchase * $orderItem->Quantity,
                ];


                // 5. XỬ LÝ LOGIC RIÊNG BIỆT CHO TỪNG LOẠI YÊU CẦU
                if ($request->input('request_type') === 'Return') {
                    $dataToCreate['BuyerShippingInfoForReturn'] = json_encode($request->input('buyer_return_address'));
                }


                // Xử lý thông tin hoàn tiền
                if (trim(strtoupper($mainOrder->PaymentMethod)) === 'VNPAY') {
                    $dataToCreate['RefundMethod'] = 'VNPAY';
                } else {
                    $dataToCreate['RefundMethod'] = 'BankTransfer';
                    $refundAccountInfo = $request->input('refund_account_info');


                    if (empty($refundAccountInfo) || empty($refundAccountInfo['bank_name']) || empty($refundAccountInfo['account_number']) || empty($refundAccountInfo['account_holder_name'])) {
                       throw ValidationException::withMessages([
                           'refund_account_info' => ['Vui lòng cung cấp đầy đủ thông tin tài khoản ngân hàng để nhận tiền hoàn.']
                       ]);
                    }
                    $dataToCreate['RefundBankName'] = $refundAccountInfo['bank_name'];
                    $dataToCreate['RefundAccountNumber'] = $refundAccountInfo['account_number'];
                    $dataToCreate['RefundAccountHolderName'] = $refundAccountInfo['account_holder_name'];
                }


                // 6. TẠO YÊU CẦU TRONG DATABASE
                $newReturnRequest = ReturnRequest::create($dataToCreate);


                // 7. CẬP NHẬT TRẠNG THÁI CÁC BẢNG LIÊN QUAN
                $orderItem->ReturnStatus = 'Requested';
                $orderItem->save();
                $sellerOrder->Status = 'ReturnInProgress';
                $sellerOrder->save();


                return $newReturnRequest;
            });


            return response()->json([
                'message' => 'Tạo yêu cầu thành công!',
                'data' => $returnRequest
            ], 201);


        } catch (ValidationException $e) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            // Log lỗi ra để dễ debug hơn
            Log::error('Lỗi khi tạo ReturnRequest: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            $statusCode = is_int($e->getCode()) && $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json(['message' => $e->getMessage()], $statusCode);
        }
    }


    /**
     * Người mua xem danh sách các yêu cầu đã tạo.
     */
    public function listMyRequests(Request $request)
    {
        $user = Auth::user();


        $myReturnRequests = ReturnRequest::where('UserID', $user->UserID)
            ->with([
                // [SỬA LỖI 4] Xóa `OverallStatus` khỏi danh sách các cột cần tải.
                'orderBuyer:OrderID,OrderCode',
                'shop:ShopID,ShopName',
                'orderItem.variant.product:ProductID,Name',
                'orderItem.variant:VariantID,ImageURL'
            ])
            ->orderBy('RequestedAt', 'desc')
            ->get();
       
        $formattedData = $myReturnRequests->map(function ($returnRequest) {
            if (!$returnRequest->orderBuyer || !$returnRequest->orderItem || !$returnRequest->orderItem->variant || !$returnRequest->orderItem->variant->product) {
                return null;
            }


            return [
                'ReturnRequestID' => $returnRequest->ReturnRequestID,
                'RequestCode'     => $returnRequest->RequestCode,
                'Status'          => $returnRequest->Status,
                'RequestType'     => $returnRequest->RequestType,
                'RequestedAt'     => $returnRequest->RequestedAt,
                'OrderID'         => $returnRequest->orderBuyer->OrderID,
                'OrderCode'       => $returnRequest->orderBuyer->OrderCode,
                'shopName'        => $returnRequest->shop->ShopName ?? 'Không có tên',
                'item' => [
                    'OrderItemID'     => $returnRequest->orderItem->OrderItemID,
                    'productName'     => $returnRequest->orderItem->variant->product->Name,
                    'productImageURL' => $returnRequest->orderItem->variant->ImageURL,
                    'Quantity'        => $returnRequest->orderItem->Quantity,
                    'PriceAtPurchase' => $returnRequest->orderItem->PriceAtPurchase,
                    'Subtotal'        => $returnRequest->orderItem->Subtotal,
                ],
            ];
        })->filter();


        return response()->json($formattedData);
    }


    /**
     * Người bán phản hồi yêu cầu Trả hàng/Hoàn tiền.
     */
    public function sellerRespond(Request $request, $id)
    {
        $user = Auth::user();


        if ($user->Role !== 'Seller' || !$user->shop) {
            return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
        }
       
        $validator = Validator::make($request->all(), [
            'action' => 'required|in:approve,reject',
            'seller_note' => 'required_if:action,reject|nullable|string|max:1000',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
       
        try {
            DB::transaction(function () use ($request, $user, $id) {
                $returnRequest = ReturnRequest::with(['orderItem', 'orderItem.sellerOrder'])
                                          ->where('ReturnRequestID', $id)
                                          ->where('ShopID', $user->shop->ShopID)
                                          ->lockForUpdate()
                                          ->firstOrFail();
               
                if ($returnRequest->Status !== 'PendingSellerApproval') {
                    throw new \Exception('Yêu cầu này đã được xử lý.', 409);
                }


                $action = $request->input('action');
                $sellerOrder = $returnRequest->orderItem->sellerOrder;


                if ($action === 'approve') {
                    $returnRequest->Status = $returnRequest->RequestType === 'Return'
                        ? 'SellerApproved_WaitForReturn'
                        : 'Approved_WaitForBankTransfer';
                   
                    $returnRequest->orderItem->ReturnStatus = 'Approved';
                    $sellerOrder->Status = 'ReturnInProgress';


                } else { // 'reject'
                    $returnRequest->Status = 'SellerRejected';
                    $returnRequest->SellerNote = $request->input('seller_note');
                    $returnRequest->orderItem->ReturnStatus = 'Rejected';
                   
                    $sellerOrder->Status = 'Delivered';
                }
               
                $returnRequest->save();
                $returnRequest->orderItem->save();
                $sellerOrder->save();


                // [SỬA LỖI 5] Xóa comment TODO không còn hợp lệ.
                // Logic để cập nhật trạng thái tổng thể giờ sẽ phức tạp hơn và cần được xử lý ở nơi khác
                // (ví dụ: khi hiển thị chi tiết đơn hàng cho người mua).


                return $returnRequest;
            });


        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Không tìm thấy yêu cầu.'], 404);
        } catch (\Exception $e) {
            $statusCode = is_int($e->getCode()) && $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json(['message' => $e->getMessage()], $statusCode);
        }


        return response()->json([
            'message' => 'Phản hồi yêu cầu thành công!'
        ]);
    }
}
