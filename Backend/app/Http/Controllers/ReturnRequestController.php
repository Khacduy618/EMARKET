<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\OrderBuyer;
use App\Models\ReturnRequest;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Storage;

class ReturnRequestController extends Controller
{
    // =================================================================
    // == API DÀNH CHO NGƯỜI MUA (BUYER)
    // =================================================================


//     public function createRequest(Request $request)

// {
//     $user = Auth::user();

//     // Kiểm tra quyền của người dùng
//     if ($user->Role !== 'Buyer') {
//         return response()->json(['message' => 'Chức năng này chỉ dành cho người mua.'], 403);
//     }

//     // 1. Kiểm tra dữ liệu đầu vào
//     $validator = Validator::make($request->all(), [
//         'order_item_id'       => 'required|integer|exists:orderitems,OrderItemID',
//         'request_type'        => 'required|in:Return,Refund',
//         'reason_description'  => 'required|string|max:1000',
//         'evidence_images'     => 'nullable|array|max:5',
//         'evidence_images.*'   => 'image|mimes:jpeg,png,jpg|max:2048',
//     ]);

//     if ($validator->fails()) {
//         return response()->json(['errors' => $validator->errors()], 422);
//     }
    
//     $orderItemId = $request->input('order_item_id');

//     // 2. Kiểm tra quyền sở hữu sản phẩm trong đơn hàng
//     // 2. Kiểm tra quyền sở hữu sản phẩm trong đơn hàng
// $orderItem = OrderItem::with(['order', 'variant.product.shop'])
//     ->where('OrderItemID', $orderItemId)
//     // TẠM THỜI VÔ HIỆU HÓA ĐIỀU KIỆN KIỂM TRA CHỦ SỞ HỮU ĐỂ TEST
    
//     ->whereHas('order', function ($query) use ($user) {
//         $query->where('UserID', $user->UserID);
//     })
//     ->first();
    
//     // Lấy đối tượng đơn hàng đã được load sẵn để sử dụng
//     $order = $orderItem->order;

//     // =================================================================
//     // BƯỚC 3: THÊM ĐIỀU KIỆN 3 NGÀY VÀO ĐÂY
//     // =================================================================

//     // 3a. Kiểm tra trạng thái đơn hàng: Chỉ cho phép khi đơn đã giao thành công
//     // Giả định trạng thái cuối cùng của bạn là 'Delivered' hoặc 'Completed'
//     if ($order->OverallStatus !== 'Delivered' && $order->OverallStatus !== 'Completed') {
//         return response()->json(['message' => 'Bạn chỉ có thể tạo yêu cầu sau khi đơn hàng đã được giao thành công.'], 400);
//     }

//     // 3b. Lấy ngày giao hàng từ cột 'UpdatedAt' (vì nó được cập nhật khi bạn đổi trạng thái)
//     $deliveryDate = $order->UpdatedAt;

//     // 3c. So sánh với ngày hiện tại để kiểm tra đã quá 3 ngày chưa
//     if (Carbon::parse($deliveryDate)->addDays(3)->isPast()) {
//         return response()->json([
//             'message' => 'Đã quá 3 ngày kể từ khi đơn hàng được giao, bạn không thể tạo yêu cầu trả hàng/hoàn tiền.'
//         ], 403); // 403 Forbidden là mã lỗi phù hợp
//     }

//     // =================================================================
//     // KẾT THÚC LOGIC MỚI
//     // =================================================================


//     // 4. Kiểm tra xem đã tồn tại yêu cầu cho sản phẩm này chưa
//     if (ReturnRequest::where('OrderItemID', $orderItemId)->exists()) {
//         return response()->json(['message' => 'Bạn đã tạo yêu cầu cho sản phẩm này rồi.'], 409);
//     }
    
//     // 5. Xử lý Upload file ảnh (nếu có)
//     $evidenceUrls = [];
//     if ($request->hasFile('evidence_images')) {
//         foreach ($request->file('evidence_images') as $image) {
//             $path = $image->store('evidence_images', 'public');
//             $evidenceUrls[] = Storage::url($path);
//         }
//     }

//     // 6. Chuẩn bị dữ liệu và TẠO bản ghi
//     $returnRequest = ReturnRequest::create([
//         'OrderID'           => $orderItem->OrderID,
//         'OrderItemID'       => $orderItem->OrderItemID,
//         'UserID'            => $user->UserID,
//         'ShopID'            => $orderItem->variant->product->shop->ShopID,
//         'RequestType'       => $request->input('request_type'),
//         'ReasonDescription' => $request->input('reason_description'),
//         // Lưu mảng URL dưới dạng JSON string sẽ an toàn và linh hoạt hơn
//         'EvidenceURLs'      => count($evidenceUrls) > 0 ? json_encode($evidenceUrls) : null,
//         'Status'            => 'PendingSellerApproval',
//     ]);
    
//     // 7. Cập nhật trạng thái của sản phẩm trong đơn hàng
//     $orderItem->ReturnStatus = 'Requested';
//     $orderItem->save();

//     // 8. Cập nhật trạng thái tổng thể của đơn hàng
//     // Sử dụng đối tượng $order đã lấy, không cần query lại
//     $order->OverallStatus = 'ReturnInProgress';
//     $order->save();

//     return response()->json([
//         'message' => 'Tạo yêu cầu trả hàng thành công!',
//         'data' => $returnRequest
//     ], 201);
// }
public function createRequest(Request $request)
{
    $user = Auth::user();

    // Kiểm tra quyền của người dùng
    if ($user->Role !== 'Buyer') {
        return response()->json(['message' => 'Chức năng này chỉ dành cho người mua.'], 403);
    }

    // =========================================================================
    // 1. CẬP NHẬT VALIDATOR ĐỂ KIỂM TRA THÊM DỮ LIỆU ĐỊA CHỈ
    // =========================================================================
    $validator = Validator::make($request->all(), [
        'order_item_id'       => 'required|integer|exists:orderitems,OrderItemID',
        'request_type'        => 'required|in:Return,Refund',
        'reason_description'  => 'required|string|max:1000',
        'evidence_images'     => 'nullable|array|max:5',
        'evidence_images.*'   => 'image|mimes:jpeg,png,jpg|max:2048',
        // Thêm validation cho địa chỉ trả hàng của người mua
        'buyer_return_address'              => 'required|array',
        'buyer_return_address.full_name'    => 'required|string|max:255',
        'buyer_return_address.phone_number' => 'required|string|max:20',
        'buyer_return_address.address_line'  => 'required|string|max:1000',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }
    
    $orderItemId = $request->input('order_item_id');

    // 2. Kiểm tra quyền sở hữu sản phẩm trong đơn hàng
    $orderItem = OrderItem::with(['order', 'variant.product.shop'])
        ->where('OrderItemID', $orderItemId)
        ->whereHas('order', function ($query) use ($user) {
            $query->where('UserID', $user->UserID);
        })
        ->first();

    if (!$orderItem) {
        return response()->json(['message' => 'Sản phẩm không thuộc đơn hàng của bạn.'], 404);
    }
    
    $order = $orderItem->order;

    // 3. Kiểm tra các điều kiện nghiệp vụ
    // 3a. Trạng thái đơn hàng
    if ($order->OverallStatus !== 'Delivered' && $order->OverallStatus !== 'Completed') {
        return response()->json(['message' => 'Bạn chỉ có thể tạo yêu cầu sau khi đơn hàng đã được giao thành công.'], 400);
    }

    // 3b. Thời hạn 3 ngày
    $deliveryDate = $order->UpdatedAt;
    if (Carbon::parse($deliveryDate)->addDays(3)->isPast()) {
        return response()->json([
            'message' => 'Đã quá 3 ngày kể từ khi đơn hàng được giao, bạn không thể tạo yêu cầu trả hàng/hoàn tiền.'
        ], 403);
    }

    // 4. Kiểm tra xem đã tồn tại yêu cầu cho sản phẩm này chưa
    if (ReturnRequest::where('OrderItemID', $orderItemId)->exists()) {
        return response()->json(['message' => 'Bạn đã tạo yêu cầu cho sản phẩm này rồi.'], 409);
    }
    
    // 5. Xử lý Upload file ảnh (nếu có)
    $evidenceUrls = [];
    if ($request->hasFile('evidence_images')) {
        foreach ($request->file('evidence_images') as $image) {
            $path = $image->store('evidence_images', 'public');
            $evidenceUrls[] = Storage::url($path);
        }
    }

    // =========================================================================
    // 6. CẬP NHẬT LOGIC TẠO BẢN GHI ĐỂ LƯU ĐỊA CHỈ
    // =========================================================================
    $returnRequest = ReturnRequest::create([
        'OrderID'           => $orderItem->OrderID,
        'OrderItemID'       => $orderItem->OrderItemID,
        'UserID'            => $user->UserID,
        'ShopID'            => $orderItem->variant->product->shop->ShopID,
        'RequestType'       => $request->input('request_type'),
        'ReasonDescription' => $request->input('reason_description'),
        'EvidenceURLs'      => count($evidenceUrls) > 0 ? json_encode($evidenceUrls) : null,
        
        // Lưu thông tin địa chỉ người mua cung cấp vào đúng cột
        'BuyerShippingInfoForReturn' => json_encode($request->input('buyer_return_address')),
        
        'Status'            => 'PendingSellerApproval',
    ]);
    
    // 7. Cập nhật trạng thái của sản phẩm trong đơn hàng
    $orderItem->ReturnStatus = 'Requested';
    $orderItem->save();

    // 8. Cập nhật trạng thái tổng thể của đơn hàng
    $order->OverallStatus = 'ReturnInProgress';
    $order->save();

    return response()->json([
        'message' => 'Tạo yêu cầu trả hàng thành công!',
        'data' => $returnRequest
    ], 201);
}

    // =================================================================
    // == API DÀNH CHO NGƯỜI BÁN (SELLER)
    // =================================================================

    /**
     * Seller xem danh sách các yêu cầu gửi đến shop của mình.
     */
    public function listShopRequests()
    {
        $user = Auth::user();
        
        // Kiểm tra xem người dùng có phải Seller và có shop không
        if ($user->Role !== 'Seller' || !$user->shop) {
             return response()->json(['message' => 'Chức năng này chỉ dành cho người bán có cửa hàng.'], 403);
        }
        
        $shopId = $user->shop->ShopID;
        
        $requests = ReturnRequest::where('ShopID', $shopId)
            ->with('user:UserID,FullName', 'orderItem.variant.product:ProductID,Name')
            ->orderBy('RequestedAt', 'desc')
            ->paginate(15);
            
        return response()->json($requests);
    }
    
    /**
     * Seller phản hồi một yêu cầu (Đồng ý hoặc Từ chối).
     */
    // public function sellerRespond(Request $request, $id)
    // {
    //     $user = Auth::user();

    //     // 1. Kiểm tra quyền của Seller
    //     if ($user->Role !== 'Seller' || !$user->shop) {
    //         return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
    //     }

    //     // 2. Kiểm tra dữ liệu đầu vào
    //     $validator = Validator::make($request->all(), [
    //         'action' => 'required|in:approve,reject',
    //         'seller_note' => 'required_if:action,reject|nullable|string|max:1000',
    //     ]);
    //     if ($validator->fails()) {
    //         return response()->json(['errors' => $validator->errors()], 422);
    //     }
        
    //     // 3. Tìm yêu cầu và kiểm tra xem có thuộc shop của seller không
    //     $returnRequest = ReturnRequest::where('ReturnRequestID', $id)
    //                                   ->where('ShopID', $user->shop->ShopID)
    //                                   ->first();
    //     if (!$returnRequest) {
    //         return response()->json(['message' => 'Không tìm thấy yêu cầu.'], 404);
    //     }
        
    //     // 4. Kiểm tra trạng thái yêu cầu phải là "Chờ duyệt"
    //     if ($returnRequest->Status !== 'PendingSellerApproval') {
    //         return response()->json(['message' => 'Yêu cầu này đã được xử lý.'], 409);
    //     }

    //     // 5. Cập nhật trạng thái
    //     if ($request->input('action') === 'approve') {
    //         $returnRequest->Status = 'SellerApproved_WaitForReturn';
    //         $returnRequest->orderItem->ReturnStatus = 'Approved';
    //     } else { // 'reject'
    //         $returnRequest->Status = 'SellerRejected';
    //         $returnRequest->SellerNote = $request->input('seller_note');
    //         $returnRequest->orderItem->ReturnStatus = 'Rejected';
    //     }
        
    //     $returnRequest->LastUpdatedAt = now();
    //     $returnRequest->save();
    //     $returnRequest->orderItem->save(); // Lưu cả thay đổi ở orderItem

    //     return response()->json([
    //         'message' => 'Phản hồi yêu cầu thành công!',
    //         'data' => $returnRequest
    //     ]);
    // }
    public function sellerRespond(Request $request, $id)
{
    $user = Auth::user();

    // 1. Kiểm tra quyền của Seller...
    if ($user->Role !== 'Seller' || !$user->shop) {
        return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
    }
    
    // 2. Validate input...
    $validator = Validator::make($request->all(), [
        'action' => 'required|in:approve,reject',
        'seller_note' => 'required_if:action,reject|nullable|string|max:1000',
    ]);
    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }
    
    // 3. Tìm yêu cầu thuộc shop của seller
    $returnRequest = ReturnRequest::where('ReturnRequestID', $id)
                                  ->where('ShopID', $user->shop->ShopID)
                                  ->first();
    if (!$returnRequest) {
        return response()->json(['message' => 'Không tìm thấy yêu cầu.'], 404);
    }
    
    if ($returnRequest->Status !== 'PendingSellerApproval') {
        return response()->json(['message' => 'Yêu cầu này đã được xử lý.'], 409);
    }

    // 4. SỬ DỤNG PHƯƠNG PHÁP GÁN TRỰC TIẾP
    if ($request->input('action') === 'approve') {
        $returnRequest->Status = 'SellerApproved_WaitForReturn';
        $returnRequest->orderItem->ReturnStatus = 'Approved';
        // Bạn có thể gán thêm các trường khác ở đây nếu cần
        // Ví dụ: $returnRequest->ResolutionType = 'ProductExchange';
    } else { // 'reject'
        $returnRequest->Status = 'SellerRejected';
        // Dòng này sẽ hoạt động hoàn hảo ngay cả khi `SellerNote` không có trong $fillable
        $returnRequest->SellerNote = $request->input('seller_note'); 
        $returnRequest->orderItem->ReturnStatus = 'Rejected';
    }
    
    // 5. Gọi save() để lưu tất cả các thay đổi vào database
    $returnRequest->save();
    $returnRequest->orderItem->save();

    return response()->json([
        'message' => 'Phản hồi yêu cầu thành công!',
        'data' => $returnRequest
    ]);
}
}