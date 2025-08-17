<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\OrderBuyer;
use App\Models\ReturnRequest;
use App\Models\OrderItem;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Log;
use Storage;

class ReturnRequestController extends Controller
{
 
// public function createRequest(Request $request)
//     {
//         $user = Auth::user();

//         // Kiểm tra quyền của người dùng
//         if ($user->Role !== 'Buyer') {
//             return response()->json(['message' => 'Chức năng này chỉ dành cho người mua.'], 403);
//         }

//         // =========================================================================
//         // 1. CẬP NHẬT VALIDATOR ĐỂ KIỂM TRA THÊM THÔNG TIN NGÂN HÀNG
//         // =========================================================================
//         $validator = Validator::make($request->all(), [
//             'order_item_id'       => 'required|integer|exists:orderitems,OrderItemID',
//             'request_type'        => 'required|in:Return,Refund',
//             'reason_description'  => 'required|string|max:1000',
//             'evidence_images'     => 'nullable|array|max:5',
//             'evidence_images.*'   => 'image|mimes:jpeg,png,jpg|max:2048',
            
//             // Validation cho địa chỉ trả hàng của người mua (vẫn cần thiết cho loại 'Return')
//             'buyer_return_address'              => 'required_if:request_type,Return|array',
//             'buyer_return_address.full_name'    => 'required_if:request_type,Return|string|max:255',
//             'buyer_return_address.phone_number' => 'required_if:request_type,Return|string|max:20',
//             'buyer_return_address.address_line' => 'required_if:request_type,Return|string|max:1000',

//             // [LOGIC MỚI] Thêm validation cho thông tin hoàn tiền
//             // Các trường này chỉ bắt buộc khi request_type là 'Refund'
//             'refund_account_info'                     => 'required_if:request_type,Refund|array',
//             'refund_account_info.bank_name'           => 'required_if:request_type,Refund|string|max:255',
//             'refund_account_info.account_number'      => 'required_if:request_type,Refund|string|max:50',
//             'refund_account_info.account_holder_name' => 'required_if:request_type,Refund|string|max:255',
//         ]);

//         if ($validator->fails()) {
//             return response()->json(['errors' => $validator->errors()], 422);
//         }
        
//         $orderItemId = $request->input('order_item_id');

//         // 2. Kiểm tra quyền sở hữu sản phẩm trong đơn hàng (giữ nguyên)
//         $orderItem = OrderItem::with(['order', 'variant.product.shop'])
//             ->where('OrderItemID', $orderItemId)
//             ->whereHas('order', function ($query) use ($user) {
//                 $query->where('UserID', $user->UserID);
//             })
//             ->first();

//         if (!$orderItem) {
//             return response()->json(['message' => 'Sản phẩm không thuộc đơn hàng của bạn.'], 404);
//         }
        
//         $order = $orderItem->order;

//         // 3. Kiểm tra các điều kiện nghiệp vụ (giữ nguyên)
//         if ($order->OverallStatus !== 'Delivered' && $order->OverallStatus !== 'Completed') {
//             return response()->json(['message' => 'Bạn chỉ có thể tạo yêu cầu sau khi đơn hàng đã được giao thành công.'], 400);
//         }

//         $deliveryDate = $order->UpdatedAt;
//         if (Carbon::parse($deliveryDate)->addDays(3)->isPast()) {
//             return response()->json([
//                 'message' => 'Đã quá 3 ngày kể từ khi đơn hàng được giao, bạn không thể tạo yêu cầu trả hàng/hoàn tiền.'
//             ], 403);
//         }

//         if (ReturnRequest::where('OrderItemID', $orderItemId)->exists()) {
//             return response()->json(['message' => 'Bạn đã tạo yêu cầu cho sản phẩm này rồi.'], 409);
//         }
        
//         // 4. Xử lý Upload file ảnh (giữ nguyên)
//         $evidenceUrls = [];
//         if ($request->hasFile('evidence_images')) {
//             foreach ($request->file('evidence_images') as $image) {
//                 $path = $image->store('evidence_images', 'public');
//                 $evidenceUrls[] = Storage::url($path);
//             }
//         }

//         // =========================================================================
//         // 5. CẬP NHẬT LOGIC TẠO BẢN GHI ĐỂ LƯU THÔNG TIN NGÂN HÀNG
//         // =========================================================================
        
//         // Lấy thông tin tài khoản hoàn tiền từ request (sẽ là null nếu không có)
//         $refundAccountInfo = $request->input('refund_account_info');

//         $returnRequest = ReturnRequest::create([
//             'OrderID'           => $orderItem->OrderID,
//             'OrderItemID'       => $orderItem->OrderItemID,
//             'UserID'            => $user->UserID,
//             'ShopID'            => $orderItem->variant->product->shop->ShopID,
//             'RequestType'       => $request->input('request_type'),
//             'ReasonDescription' => $request->input('reason_description'),
//             'EvidenceURLs'      => count($evidenceUrls) > 0 ? json_encode($evidenceUrls) : null,
            
//             // Nếu là 'Return', lưu địa chỉ trả hàng. Nếu không, lưu null.
//             'BuyerShippingInfoForReturn' => $request->input('request_type') === 'Return' 
//                                             ? json_encode($request->input('buyer_return_address')) 
//                                             : null,
            
//             'Status'            => 'PendingSellerApproval',

//             // [LOGIC MỚI] Lưu thông tin tài khoản ngân hàng
//             // Nếu refundAccountInfo là null (trường hợp 'Return'), các trường này sẽ được lưu là NULL.
//             'RefundBankName'          => $refundAccountInfo['bank_name'] ?? null,
//             'RefundAccountNumber'     => $refundAccountInfo['account_number'] ?? null,
//             'RefundAccountHolderName' => $refundAccountInfo['account_holder_name'] ?? null,
//         ]);
        
//         // 6. Cập nhật trạng thái (giữ nguyên)
//         $orderItem->ReturnStatus = 'Requested';
//         $orderItem->save();
//         $order->OverallStatus = 'ReturnInProgress';
//         $order->save();

//         return response()->json([
//             'message' => 'Tạo yêu cầu thành công!',
//             'data' => $returnRequest
//         ], 201);
//     }

    // =================================================================
    // == TEST LẠI
    //  public function createRequest(Request $request)
    // {
    //     $user = Auth::user();

    //     // Kiểm tra quyền của người dùng
    //     if ($user->Role !== 'Buyer') {
    //         return response()->json(['message' => 'Chức năng này chỉ dành cho người mua.'], 403);
    //     }

    //     // =========================================================================
    //     // 1. [SỬA LỖI] VALIDATOR ĐƯỢC NỚI LỎNG
    //     // Không còn bắt buộc 'refund_account_info' ở bước này nữa.
    //     // =========================================================================
    //     $validator = Validator::make($request->all(), [
    //         'order_item_id'       => 'required|integer|exists:orderitems,OrderItemID',
    //         'request_type'        => 'required|in:Return,Refund',
    //         'reason_description'  => 'required|string|max:1000',
    //         'evidence_images'     => 'nullable|array|max:5',
    //         'evidence_images.*'   => 'image|mimes:jpeg,png,jpg|max:2048',

    //         // Validation cho địa chỉ trả hàng (vẫn giữ nguyên)
    //         'buyer_return_address'              => 'required_if:request_type,Return|array',
    //         'buyer_return_address.full_name'    => 'required_if:request_type,Return|string|max:255',
    //         'buyer_return_address.phone_number' => 'required_if:request_type,Return|string|max:20',
    //         'buyer_return_address.address_line' => 'required_if:request_type,Return|string|max:1000',

    //         // Chỉ validate định dạng của thông tin ngân hàng NẾU nó được cung cấp
    //         'refund_account_info'                     => 'nullable|array',
    //         'refund_account_info.bank_name'           => 'required_with:refund_account_info|string|max:255',
    //         'refund_account_info.account_number'      => 'required_with:refund_account_info|string|max:50',
    //         'refund_account_info.account_holder_name' => 'required_with:refund_account_info|string|max:255',
    //     ]);

    //     if ($validator->fails()) {
    //         return response()->json(['errors' => $validator->errors()], 422);
    //     }

    //     // Kiểm tra quyền sở hữu sản phẩm và các điều kiện nghiệp vụ
    //     $orderItemId = $request->input('order_item_id');
    //     $orderItem = OrderItem::with(['order', 'variant.product.shop'])
    //         ->where('OrderItemID', $orderItemId)
    //         ->whereHas('order', function ($query) use ($user) {
    //             $query->where('UserID', $user->UserID);
    //         })
    //         ->first();

    //     if (!$orderItem) {
    //         return response()->json(['message' => 'Sản phẩm không thuộc đơn hàng của bạn.'], 404);
    //     }
    //     $order = $orderItem->order;

    //     if ($order->OverallStatus !== 'Delivered' && $order->OverallStatus !== 'Completed') {
    //         return response()->json(['message' => 'Bạn chỉ có thể tạo yêu cầu sau khi đơn hàng đã được giao thành công.'], 400);
    //     }
    //     if (Carbon::parse($order->UpdatedAt)->addDays(3)->isPast()) {
    //         return response()->json(['message' => 'Đã quá 3 ngày kể từ khi đơn hàng được giao, bạn không thể tạo yêu cầu.'], 403);
    //     }
    //     if (ReturnRequest::where('OrderItemID', $orderItemId)->exists()) {
    //         return response()->json(['message' => 'Bạn đã tạo yêu cầu cho sản phẩm này rồi.'], 409);
    //     }

    //     // Xử lý upload file ảnh
    //     $evidenceUrls = [];
    //     if ($request->hasFile('evidence_images')) {
    //         foreach ($request->file('evidence_images') as $image) {
    //             $path = $image->store('evidence_images', 'public');
    //             $evidenceUrls[] = Storage::url($path);
    //         }
    //     }

    //     $requestType = $request->input('request_type');
    //     $refundMethod = null;
    //     $refundBankName = null;
    //     $refundAccountNumber = null;
    //     $refundAccountHolderName = null;

    //     if ($requestType === 'Refund') {
    //         if ($order->PaymentMethod === 'VNPay') {
    //             $refundMethod = 'VNPAY';
    //         } else {
    //             // =========================================================================
    //             // 2. [SỬA LỖI] KIỂM TRA THÔNG TIN NGÂN HÀNG THỦ CÔNG TẠI ĐÂY
    //             // =========================================================================
    //             $refundMethod = 'BankTransfer';
    //             $refundAccountInfo = $request->input('refund_account_info');

    //             if (empty($refundAccountInfo) || empty($refundAccountInfo['bank_name']) || empty($refundAccountInfo['account_number']) || empty($refundAccountInfo['account_holder_name'])) {
    //                 // Trả về lỗi nếu không phải VNPAY và cũng không có thông tin ngân hàng
    //                 return response()->json([
    //                     'message' => 'The given data was invalid.',
    //                     'errors' => [
    //                         'refund_account_info' => ['Vui lòng cung cấp đầy đủ thông tin tài khoản ngân hàng để nhận tiền hoàn.']
    //                     ]
    //                 ], 422);
    //             }
    //             $refundBankName = $refundAccountInfo['bank_name'];
    //             $refundAccountNumber = $refundAccountInfo['account_number'];
    //             $refundAccountHolderName = $refundAccountInfo['account_holder_name'];
    //         }
    //     }

    //     // Tạo bản ghi ReturnRequest
    //     $returnRequest = ReturnRequest::create([
    //         'OrderID'           => $orderItem->OrderID,
    //         'OrderItemID'       => $orderItem->OrderItemID,
    //         'UserID'            => $user->UserID,
    //         'ShopID'            => $orderItem->variant->product->shop->ShopID,
    //         'RequestType'       => $requestType,
    //         'ReasonDescription' => $request->input('reason_description'),
    //         'EvidenceURLs'      => count($evidenceUrls) > 0 ? json_encode($evidenceUrls) : null,
    //         'Status'            => 'PendingSellerApproval',
    //         'BuyerShippingInfoForReturn' => $requestType === 'Return' ? json_encode($request->input('buyer_return_address')) : null,
    //         'RefundMethod'            => $refundMethod,
    //         'RefundBankName'          => $refundBankName,
    //         'RefundAccountNumber'     => $refundAccountNumber,
    //         'RefundAccountHolderName' => $refundAccountHolderName,
    //         // Gợi ý số tiền hoàn ban đầu, người bán/admin có thể thay đổi
    //         'RefundAmount'            => $orderItem->PriceAtPurchase * $orderItem->Quantity,
    //     ]);

    //     // Cập nhật trạng thái
    //     $orderItem->ReturnStatus = 'Requested';
    //     $orderItem->save();
    //     $order->OverallStatus = 'ReturnInProgress';
    //     $order->save();

    //     return response()->json([
    //         'message' => 'Tạo yêu cầu thành công!',
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

        // Validator đã được nới lỏng, không bắt buộc 'refund_account_info' ở đây
        // vì chúng ta sẽ kiểm tra thủ công dựa trên phương thức thanh toán của đơn hàng.
        $validator = Validator::make($request->all(), [
            'order_item_id'       => 'required|integer|exists:orderitems,OrderItemID',
            'request_type'        => 'required|in:Return,Refund',
            'reason_description'  => 'required|string|max:1000',
            'evidence_images'     => 'nullable|array|max:5',
            'evidence_images.*'   => 'image|mimes:jpeg,png,jpg|max:5120',

            // Validation cho địa chỉ trả hàng (chỉ yêu cầu khi request_type là 'Return')
            'buyer_return_address'              => 'required_if:request_type,Return|array',
            'buyer_return_address.full_name'    => 'required_if:request_type,Return|string|max:255',
            'buyer_return_address.phone_number' => 'required_if:request_type,Return|string|max:20',
            'buyer_return_address.address_line' => 'required_if:request_type,Return|string|max:1000',

            // Chỉ validate định dạng của thông tin ngân hàng NẾU nó được cung cấp
            'refund_account_info'                     => 'nullable|array',
            'refund_account_info.bank_name'           => 'required_with:refund_account_info|string|max:255',
            'refund_account_info.account_number'      => 'required_with:refund_account_info|string|max:50',
            'refund_account_info.account_holder_name' => 'required_with:refund_account_info|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Kiểm tra quyền sở hữu sản phẩm và các điều kiện nghiệp vụ
        $orderItemId = $request->input('order_item_id');
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

        if ($order->OverallStatus !== 'Delivered' && $order->OverallStatus !== 'Completed') {
            return response()->json(['message' => 'Bạn chỉ có thể tạo yêu cầu sau khi đơn hàng đã được giao thành công.'], 400);
        }
        if (Carbon::parse($order->UpdatedAt)->addDays(3)->isPast()) {
            return response()->json(['message' => 'Đã quá 3 ngày kể từ khi đơn hàng được giao, bạn không thể tạo yêu cầu.'], 403);
        }
        if (ReturnRequest::where('OrderItemID', $orderItemId)->exists()) {
            return response()->json(['message' => 'Bạn đã tạo yêu cầu cho sản phẩm này rồi.'], 409);
        }

        // Xử lý upload file ảnh
        $evidenceUrls = [];
        if ($request->hasFile('evidence_images')) {
            foreach ($request->file('evidence_images') as $image) {
                $path = $image->store('evidence_images', 'public');
                $evidenceUrls[] = Storage::url($path);
            }
        }

        $requestType = $request->input('request_type');
        $refundMethod = null;
        $refundBankName = null;
        $refundAccountNumber = null;
        $refundAccountHolderName = null;

        // =========================================================================
        // [SỬA ĐỔI] ÁP DỤNG LOGIC HOÀN TIỀN CHO CẢ "RETURN" VÀ "REFUND"
        // Vì sau khi trả hàng (Return) thành công, người mua cũng cần nhận lại tiền.
        // =========================================================================
        if ($requestType === 'Return' || $requestType === 'Refund') {
            // Nếu đơn hàng thanh toán qua VNPay, ưu tiên hoàn tiền qua VNPay
            if ($order->PaymentMethod === 'VNPay') {
                $refundMethod = 'VNPAY';
            } else {
                // Nếu là các phương thức khác (ví dụ: COD), yêu cầu thông tin ngân hàng
                $refundMethod = 'BankTransfer';
                $refundAccountInfo = $request->input('refund_account_info');

                // Kiểm tra thủ công xem thông tin ngân hàng đã được cung cấp chưa
                if (empty($refundAccountInfo) || empty($refundAccountInfo['bank_name']) || empty($refundAccountInfo['account_number']) || empty($refundAccountInfo['account_holder_name'])) {
                    // Trả về lỗi nếu không phải VNPAY và cũng không có thông tin ngân hàng
                    return response()->json([
                        'message' => 'The given data was invalid.',
                        'errors' => [
                            'refund_account_info' => ['Vui lòng cung cấp đầy đủ thông tin tài khoản ngân hàng để nhận tiền hoàn.']
                        ]
                    ], 422);
                }
                $refundBankName = $refundAccountInfo['bank_name'];
                $refundAccountNumber = $refundAccountInfo['account_number'];
                $refundAccountHolderName = $refundAccountInfo['account_holder_name'];
            }
        }

        // Tạo bản ghi ReturnRequest
        $returnRequest = ReturnRequest::create([
            'OrderID'           => $orderItem->OrderID,
            'OrderItemID'       => $orderItem->OrderItemID,
            'UserID'            => $user->UserID,
            'ShopID'            => $orderItem->variant->product->shop->ShopID,
            'RequestType'       => $requestType,
            'ReasonDescription' => $request->input('reason_description'),
            'EvidenceURLs'      => count($evidenceUrls) > 0 ? json_encode($evidenceUrls) : null,
            'Status'            => 'PendingSellerApproval',
            // Chỉ lưu địa chỉ trả hàng khi loại yêu cầu là 'Return'
            'BuyerShippingInfoForReturn' => $requestType === 'Return' ? json_encode($request->input('buyer_return_address')) : null,
            
            // Các trường thông tin hoàn tiền giờ sẽ được lưu cho cả hai loại yêu cầu
            'RefundMethod'            => $refundMethod,
            'RefundBankName'          => $refundBankName,
            'RefundAccountNumber'     => $refundAccountNumber,
            'RefundAccountHolderName' => $refundAccountHolderName,
            
            // Gợi ý số tiền hoàn ban đầu, người bán/admin có thể thay đổi
            'RefundAmount'            => $orderItem->PriceAtPurchase * $orderItem->Quantity,
        ]);

        // Cập nhật trạng thái
        $orderItem->ReturnStatus = 'Requested';
        $orderItem->save();
        $order->OverallStatus = 'ReturnInProgress';
        $order->save();

        return response()->json([
            'message' => 'Tạo yêu cầu thành công!',
            'data' => $returnRequest
        ], 201);
    }
     public function listMyRequests(Request $request)
    {
        $user = Auth::user();

        // 1. Lấy tất cả các yêu cầu trả hàng của user này
        // Sử dụng `whereHas` để đảm bảo chỉ lấy các yêu cầu từ đơn hàng của chính họ
        $myReturnRequests = ReturnRequest::whereHas('order', function ($query) use ($user) {
            $query->where('UserID', $user->UserID); // Giả sử cột khóa ngoại là UserID
        })
        ->with([
            // 2. Lấy luôn các thông tin liên quan để hiển thị
            'order' => function ($query) {
                // Lấy thông tin của Order, và từ Order lấy tiếp thông tin Shop và Items
                $query->with([
                    'shop:ShopID,ShopName,ShopLevel', // Chọn các cột cần thiết từ Shop
                    'items' => function ($itemQuery) {
                        // Từ Items, lấy tiếp thông tin Product
                        $itemQuery->with('product:ProductID,Name,ProductImageURL');
                    }
                ]);
            }
        ])
        ->orderBy('RequestedAt', 'desc')
        ->get();

        // 3. Định dạng lại dữ liệu để khớp với component `OrderCard`
        $formattedData = $myReturnRequests->map(function ($returnRequest) {
            // Kiểm tra để đảm bảo order tồn tại, tránh lỗi
            if (!$returnRequest->order) {
                return null;
            }
            
            // Gộp dữ liệu từ order và return request thành một object duy nhất
            // Cấu trúc này phải khớp với những gì component OrderCard đang mong đợi
            return [
                // === Các trường dữ liệu từ Order ===
                'OrderID' => $returnRequest->order->OrderID,
                'OrderCode' => $returnRequest->order->OrderCode,
                'OverallStatus' => $returnRequest->order->OverallStatus,
                'TotalAmount' => $returnRequest->order->TotalAmount,
                'OrderDate' => $returnRequest->order->OrderDate,
                'shopName' => $returnRequest->order->shop->ShopName ?? 'Không có tên',
                'shopLevel' => $returnRequest->order->shop->ShopLevel ?? 'Normal',
                
                // === Định dạng lại mảng items cho đúng chuẩn ===
                'items' => $returnRequest->order->items->map(function ($item) {
                    return [
                        'OrderItemID' => $item->OrderItemID,
                        'productName' => $item->product->Name ?? 'Sản phẩm không tên',
                        'productImageURL' => $item->product->ProductImageURL ?? '',
                        'classification' => $item->Classification,
                        'Quantity' => $item->Quantity,
                        'PriceAtPurchase' => $item->PriceAtPurchase,
                        'OriginalPrice' => $item->OriginalPrice, // Thêm nếu cần
                    ];
                }),

                // === TRƯỜNG QUAN TRỌNG NHẤT: Thêm ReturnID ===
                'ReturnID' => $returnRequest->ReturnID,
            ];
        })->filter(); // Dùng filter() để loại bỏ các giá trị null nếu có

        return response()->json($formattedData);
    }
//     // =================================================================
//     // == API DÀNH CHO NGƯỜI BÁN (SELLER)
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
/** CRUD SELLER */

}