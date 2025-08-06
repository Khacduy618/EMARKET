<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\OrderBuyer;
use App\Models\ReturnRequest;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Storage;

class ReturnRequestController extends Controller
{
    // =================================================================
    // == API DÀNH CHO NGƯỜI MUA (BUYER)
    // =================================================================

    /**
     * Buyer tạo một yêu cầu trả hàng/hoàn tiền mới.
     */
//      public function createRequest(Request $request)
//     {
//         $user = Auth::user();

//         // Kiểm tra quyền của người dùng
//         if ($user->Role !== 'Buyer') {
//             return response()->json(['message' => 'Chức năng này chỉ dành cho người mua.'], 403);
//         }

//         // 1. Kiểm tra dữ liệu đầu vào, bao gồm cả file ảnh
//         $validator = Validator::make($request->all(), [
//             'order_item_id'       => 'required|integer|exists:orderitems,OrderItemID',
//             'request_type'        => 'required|in:Return,Refund,ReturnAndRefund',
//             'reason_description'  => 'required|string|max:1000',
//             'evidence_images'     => 'nullable|array|max:5', // Cho phép gửi tối đa 5 ảnh
//             'evidence_images.*'   => 'image|mimes:jpeg,png,jpg|max:2048', // Mỗi ảnh là file ảnh, max 2MB
//         ]);

//         if ($validator->fails()) {
//             return response()->json(['errors' => $validator->errors()], 422);
//         }
        
//         $orderItemId = $request->input('order_item_id');

//         // 2. Kiểm tra quyền sở hữu sản phẩm trong đơn hàng
//         $orderItem = OrderItem::with('order', 'variant.product.shop')
//             ->where('OrderItemID', $orderItemId)
//             ->whereHas('order', function ($query) use ($user) {
//                 $query->where('UserID', $user->UserID);
//             })
//             ->first();

//         if (!$orderItem) {
//             return response()->json(['message' => 'Sản phẩm không thuộc đơn hàng của bạn.'], 404);
//         }
        
//         // 3. Kiểm tra xem đã tồn tại yêu cầu cho sản phẩm này chưa
//         if (ReturnRequest::where('OrderItemID', $orderItemId)->exists()) {
//             return response()->json(['message' => 'Bạn đã tạo yêu cầu cho sản phẩm này rồi.'], 409);
//         }
        
//         // 4. Xử lý Upload file ảnh (nếu có)
//        $evidenceUrls = []; // <--- BƯỚC 1: Khởi tạo một mảng rỗng

//         if ($request->hasFile('evidence_images')) { // <--- BƯỚC 2: Kiểm tra xem request CÓ file không
//             // Nếu có file, đoạn code này mới chạy
//             foreach ($request->file('evidence_images') as $image) {
//                 $path = $image->store('public/return_evidence');
//                 $evidenceUrls[] = Storage::url($path); // Thêm URL vào mảng
//             }
//         }

//         // BƯỚC 3: Tạo bản ghi
//         $returnRequest = ReturnRequest::create([
//             // ... các trường khác
//             'EvidenceURLs' => $evidenceUrls, // Gán giá trị của mảng $evidenceUrls vào cột
//         ]);
        
//         // 5. Tạo yêu cầu mới trong database
//        $dataToCreate = [
//     'OrderID'           => $orderItem->OrderID,
//     'OrderItemID'       => $orderItem->OrderItemID,
//     'UserID'            => $user->UserID,
//     'ShopID'            => $orderItem->variant->product->shop->ShopID, // Chú ý dòng này
//     'RequestType'       => $request->input('request_type'),
//     'ReasonDescription' => $request->input('reason_description'),
//     'EvidenceURLs'      => $evidenceUrls,
//     'Status'            => 'PendingSellerApproval',
// ];
        
//         // 6. Cập nhật trạng thái của sản phẩm trong đơn hàng
//         $orderItem->ReturnStatus = 'Requested';
//         $orderItem->save();

//         return response()->json([
//             'message' => 'Tạo yêu cầu trả hàng thành công!',
//             'data' => $returnRequest
//         ], 201);
//     }
      public function createRequest(Request $request)
    {
        $user = Auth::user();

        // Kiểm tra quyền của người dùng
        if ($user->Role !== 'Buyer') {
            return response()->json(['message' => 'Chức năng này chỉ dành cho người mua.'], 403);
        }

        // 1. Kiểm tra dữ liệu đầu vào
        $validator = Validator::make($request->all(), [
            'order_item_id'       => 'required|integer|exists:orderitems,OrderItemID',
            'request_type'        => 'required|in:Return,Refund',
            'reason_description'  => 'required|string|max:1000',
            'evidence_images'     => 'nullable|array|max:5',
            'evidence_images.*'   => 'image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $orderItemId = $request->input('order_item_id');

        // 2. Kiểm tra quyền sở hữu sản phẩm trong đơn hàng
        $orderItem = OrderItem::with('order', 'variant.product.shop')
            ->where('OrderItemID', $orderItemId)
            ->whereHas('order', function ($query) use ($user) {
                $query->where('UserID', $user->UserID);
            })
            ->first();

        if (!$orderItem) {
            return response()->json(['message' => 'Sản phẩm không thuộc đơn hàng của bạn.'], 404);
        }
        
        // 3. Kiểm tra xem đã tồn tại yêu cầu cho sản phẩm này chưa
        if (ReturnRequest::where('OrderItemID', $orderItemId)->exists()) {
            return response()->json(['message' => 'Bạn đã tạo yêu cầu cho sản phẩm này rồi.'], 409);
        }
        
        // 4. Xử lý Upload file ảnh (nếu có)
  // 4. Xử lý Upload file ảnh (SỬA LẠI TÊN Ở ĐÂY)
    $evidenceUrls = [];
    
    // Dùng 'evidence_images' (viết thường)
     if ($request->hasFile('evidence_images')) {
        foreach ($request->file('evidence_images') as $image) {
            
            // BƯỚC 2: Lưu file vào THƯ MỤC 'public/uploads'
            // Bạn có thể đổi 'uploads' thành bất kỳ tên nào bạn muốn, ví dụ 'return_evidence'
             $path = $image->store('evidence_images', 'public');
            // Lấy URL công khai của file đã lưu
            $evidenceUrls[] = Storage::url($path);
        }
    }
    

    

        
        // 5. Chuẩn bị dữ liệu và TẠO bản ghi MỘT LẦN DUY NHẤT
        $dataToCreate = [
            'OrderID'           => $orderItem->OrderID,
            'OrderItemID'       => $orderItem->OrderItemID,
            'UserID'            => $user->UserID,
            'ShopID'            => $orderItem->variant->product->shop->ShopID,
            'RequestType'       => $request->input('request_type'),
            'ReasonDescription' => $request->input('reason_description'),
            'EvidenceURLs'      => $evidenceUrls,
            'Status'            => 'PendingSellerApproval',
        ];
        
        // Sử dụng $dataToCreate để tạo bản ghi
        $returnRequest = ReturnRequest::create($dataToCreate);
        
        // 6. Cập nhật trạng thái của sản phẩm trong đơn hàng
        $orderItem->ReturnStatus = 'Requested';
        $orderItem->save();

        $statusOrder = OrderBuyer::where('OrderID', $orderItem->OrderID)
    ->update(['OverallStatus' => 'ReturnInProgress']);

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