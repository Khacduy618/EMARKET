<?php

// namespace App\Http\Controllers;

// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\DB;
// use Illuminate\Support\Facades\Log;
// use Illuminate\Support\Facades\Auth;
// use Illuminate\Support\Facades\Validator;

// class ReviewController extends Controller
// {
//     // Lưu đánh giá cho từng sản phẩm trong đơn hàng
//     public function store(Request $request)
//     {

//         $validator = Validator::make($request->all(), [
//             'orderId' => 'required|integer|exists:ordersbuyer,OrderID',
//             'reviews' => 'required|string', // reviews will be a JSON string
//         ]);
        
//         if ($validator->fails()) {
//             return response()->json(['success' => false, 'error' => 'Dữ liệu không hợp lệ.', 'details' => $validator->errors()], 422);
//         }

//         $orderId = $request->input('orderId');
//         $reviews = json_decode($request->input('reviews'), true);
//         $userId = Auth::id();

//         if (!is_array($reviews)) {
//              return response()->json(['success' => false, 'error' => 'Định dạng reviews không đúng.'], 422);
//         }
        
//         Log::info('ReviewController.store - Request data', [
//             'orderId' => $orderId,
//             'reviews' => $reviews,
//             'userId' => $userId,
//         ]);
//         $saved = [];
//         DB::beginTransaction();
//         try {
//             foreach ($reviews as $idx => $review) {
//                 Log::info('ReviewController.store - Review item', [
//                     'idx' => $idx,
//                     'review' => $review,
//                 ]);
//                 $imagePaths = [];
//                 $videoPaths = [];
//                 // Nếu có file upload hình ảnh
//                 if ($request->hasFile("images.$idx")) {
//                     $files = $request->file("images.$idx");
//                     if (!is_array($files)) {
//                         $files = [$files];
//                     }
//                     foreach ($files as $fileIdx => $file) {
//                         try {
//                             $path = $file->store('review_images', 'public');
//                             $imagePaths[] = $path;
//                             Log::info('ReviewController.store - Uploaded image', [
//                                 'idx' => $idx,
//                                 'fileIdx' => $fileIdx,
//                                 'path' => $path,
//                             ]);
//                         } catch (\Exception $e) {
//                             Log::error('ReviewController.store - Image upload failed', [
//                                 'idx' => $idx,
//                                 'fileIdx' => $fileIdx,
//                                 'error' => $e->getMessage(),
//                             ]);
//                         }
//                     }
//                 }
//                 // Nếu có file upload video
//                 if ($request->hasFile("videos.$idx")) {
//                     $files = $request->file("videos.$idx");
//                     if (!is_array($files)) {
//                         $files = [$files];
//                     }
//                     foreach ($files as $fileIdx => $file) {
//                         try {
//                             $path = $file->store('review_videos', 'public');
//                             $videoPaths[] = $path;
//                             Log::info('ReviewController.store - Uploaded video', [
//                                 'idx' => $idx,
//                                 'fileIdx' => $fileIdx,
//                                 'path' => $path,
//                             ]);
//                         } catch (\Exception $e) {
//                             Log::error('ReviewController.store - Video upload failed', [
//                                 'idx' => $idx,
//                                 'fileIdx' => $fileIdx,
//                                 'error' => $e->getMessage(),
//                             ]);
//                         }
//                     }
//                 }
//                 // Nếu frontend gửi url (không phải file), thêm vào mảng
//                 if (!empty($review['images']) && is_array($review['images'])) {
//                     foreach ($review['images'] as $imgUrl) {
//                         if (is_string($imgUrl) && !str_starts_with($imgUrl, 'blob:')) {
//                             $imagePaths[] = $imgUrl;
//                         }
//                     }
//                 }
//                 if (!empty($review['videos']) && is_array($review['videos'])) {
//                     foreach ($review['videos'] as $vidUrl) {
//                         if (is_string($vidUrl) && !str_starts_with($vidUrl, 'blob:')) {
//                             $videoPaths[] = $vidUrl;
//                         }
//                     }
//                 }
//                 // Lưu review với mảng đường dẫn hình/video
//                 $insertData = [
//                     'OrderID' => $orderId,
//                     'VariantID' => $review['productId'],
//                     'UserID' => $userId,
//                     'Rating' => $review['rating'],
//                     'Comment' => $review['reviewText'],
//                     'ReviewImages' => json_encode($imagePaths),
//                     'ReviewVideo' => json_encode($videoPaths),
//                     'CreatedAt' => now(),
//                     'UpdatedAt' => now(),
//                 ];
//                 Log::info('ReviewController.store - Insert data', $insertData);
//                 DB::table('productreviews')->insert($insertData);
//                 $saved[] = $review['productId'];
//             }
//             DB::commit();
//             return response()->json(['success' => true, 'saved' => $saved]);
//         } catch (\Exception $e) {
//             DB::rollBack();
//             Log::error('Review save failed', [
//                 'error' => $e->getMessage(),
//                 'orderId' => $orderId,
//                 'reviews' => $reviews,
//                 'userId' => $userId,
//             ]);
//             return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
//         }
//     }
// }

// namespace App\Http\Controllers;

// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\DB;
// use Illuminate\Support\Facades\Log;
// use Illuminate\Support\Facades\Auth;
// use Illuminate\Support\Facades\Validator; // <-- Import Validator

// class ReviewController extends Controller
// {
//     public function store(Request $request)
//     {
//         $validator = Validator::make($request->all(), [
//             'orderId' => 'required|integer|exists:ordersbuyer,OrderID',
//             'reviews' => 'required|string', // reviews will be a JSON string
//         ]);

//         if ($validator->fails()) {
//             return response()->json(['success' => false, 'error' => 'Dữ liệu không hợp lệ.', 'details' => $validator->errors()], 422);
//         }

//         $orderId = $request->input('orderId');
//         $reviews = json_decode($request->input('reviews'), true);
//         $userId = Auth::id();

//         // Further validation for the decoded reviews array
//         if (!is_array($reviews)) {
//              return response()->json(['success' => false, 'error' => 'Định dạng reviews không đúng.'], 422);
//         }

//         // Verify that the order belongs to the authenticated user
//         $order = DB::table('ordersbuyer')->where('OrderID', $orderId)->where('UserID', $userId)->first();
//         if (!$order) {
//             return response()->json(['success' => false, 'error' => 'Không tìm thấy đơn hàng hoặc bạn không có quyền đánh giá.'], 403);
//         }

//         DB::beginTransaction();
//         try {
//             foreach ($reviews as $idx => $reviewData) {
//                 // IMPORTANT: Verify that the OrderItemID from the review belongs to the actual order
//                 $orderItem = DB::table('orderitems')
//                     ->where('OrderItemID', $reviewData['productId']) // Frontend sends OrderItemID as 'productId'
//                     ->where('OrderID', $orderId)
//                     ->first();

//                 if (!$orderItem) {
//                     // Skip if the item doesn't belong to this order
//                     Log::warning('Attempt to review an item not in the order.', ['orderId' => $orderId, 'orderItemId' => $reviewData['productId']]);
//                     continue;
//                 }

//                 // Check if already reviewed
//                 $alreadyReviewed = DB::table('productreviews')->where('OrderItemID', $orderItem->OrderItemID)->exists();
//                 if ($alreadyReviewed) {
//                     continue; // Silently skip if already reviewed
//                 }

//                 $imagePaths = [];
//                 $videoPaths = [];

//                 // Laravel can handle nested file arrays like 'images.0', 'images.1' etc.
//                 if ($request->hasFile("images.$idx")) {
//                     foreach ($request->file("images.$idx") as $file) {
//                         $path = $file->store('review_images', 'public');
//                         $imagePaths[] = $path;
//                     }
//                 }

//                 if ($request->hasFile("videos.$idx")) {
//                      foreach ($request->file("videos.$idx") as $file) {
//                         $path = $file->store('review_videos', 'public');
//                         $videoPaths[] = $path;
//                     }
//                 }

//                 DB::table('productreviews')->insert([
//                     'OrderID' => $orderId,
//                     'OrderItemID' => $orderItem->OrderItemID, // Use the verified OrderItemID
//                     'VariantID' => $orderItem->VariantID, // Use VariantID from the verified order item
//                     'UserID' => $userId,
//                     'Rating' => $reviewData['rating'],
//                     'Comment' => $reviewData['reviewText'],
//                     'ReviewImages' => json_encode($imagePaths),
//                     'ReviewVideo' => json_encode($videoPaths), // Ensure your DB table has this column
//                     'Status' => 'Pending', // Set a default status for admin approval
//                     'CreatedAt' => now(),
//                     'UpdatedAt' => now(),
//                 ]);
//             }

//             DB::commit();
//             return response()->json(['success' => true, 'message' => 'Đánh giá đã được gửi thành công.']);

//         } catch (\Exception $e) {
//             DB::rollBack();
//             Log::error('Review save failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
//             return response()->json(['success' => false, 'error' => 'Đã có lỗi xảy ra phía máy chủ.'], 500);
//         }
//     }
// }
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'orderId' => 'required|integer|exists:ordersbuyer,OrderID',
            'reviews' => 'required|string',
            'images' => 'nullable|array',
            'images.*' => 'nullable|array',
            'images.*.*' => 'file|mimes:jpg,jpeg,png,gif|max:5120', // Giới hạn 5MB mỗi ảnh
            'videos' => 'nullable|array',
            'videos.*' => 'nullable|array',
            'videos.*.*' => 'file|mimes:mp4,mov,avi|max:30720', // Giới hạn 30MB mỗi video
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => 'Dữ liệu không hợp lệ.', 'details' => $validator->errors()], 422);
        }

        $orderId = $request->input('orderId');
        $reviewsData = json_decode($request->input('reviews'), true);
        $userId = Auth::id();

        if (!is_array($reviewsData)) {
            return response()->json(['success' => false, 'error' => 'Định dạng dữ liệu đánh giá không hợp lệ.'], 400);
        }

        $order = DB::table('ordersbuyer')->where('OrderID', $orderId)->where('UserID', $userId)->first();
        if (!$order) {
            return response()->json(['success' => false, 'error' => 'Đơn hàng không tồn tại hoặc bạn không có quyền đánh giá.'], 403);
        }

        DB::beginTransaction();
        try {
            $allUploadedImages = $request->file('images', []);
            $allUploadedVideos = $request->file('videos', []);

            foreach ($reviewsData as $idx => $review) {
                $orderItemId = $review['productId'];

                // Kiểm tra bảo mật: đảm bảo item này thuộc về đơn hàng đang được đánh giá
                $orderItem = DB::table('orderitems')
                    ->where('OrderItemID', $orderItemId)
                    ->where('OrderID', $orderId)
                    ->first();

                if (!$orderItem) {
                    continue; // Bỏ qua nếu item không hợp lệ
                }

                // *** LOGIC ĐÃ ĐƯỢC SỬA LẠI ***
                // Bây giờ câu lệnh này sẽ chạy đúng vì cột `OrderItemID` đã tồn tại
                $alreadyReviewed = DB::table('productreviews')->where('OrderItemID', $orderItem->OrderItemID)->exists();
                if ($alreadyReviewed) {
                    continue; // Bỏ qua nếu đã đánh giá rồi
                }

                // Xử lý upload file
                $imagePaths = [];
                if (isset($allUploadedImages[$idx]) && is_array($allUploadedImages[$idx])) {
                    foreach ($allUploadedImages[$idx] as $file) {
                        if ($file && $file->isValid()) {
                            $imagePaths[] = $file->store('review_images', 'public');
                        }
                    }
                }
                
                $videoPaths = [];
                if (isset($allUploadedVideos[$idx]) && is_array($allUploadedVideos[$idx])) {
                    foreach ($allUploadedVideos[$idx] as $file) {
                        if ($file && $file->isValid()) {
                            $videoPaths[] = $file->store('review_videos', 'public');
                        }
                    }
                }

                // Lưu vào database
                DB::table('productreviews')->insert([
                    'OrderID' => $orderId,
                    'OrderItemID' => $orderItem->OrderItemID, // <-- Lưu lại liên kết quan trọng này
                    'VariantID' => $orderItem->VariantID,
                    'UserID' => $userId,
                    'Rating' => $review['rating'],
                    'Comment' => $review['reviewText'],
                    'ReviewImages' => json_encode($imagePaths),
                    'ReviewVideo' => json_encode($videoPaths),
                    'Status' => 'Approved',
                    'CreatedAt' => now(),
                    'UpdatedAt' => now(),
                ]);
            }
            // Nếu tất cả đánh giá đã được lưu thành công
            Log::info('All reviews saved successfully for OrderID: ' . $orderId,
                ['userId' => $userId, 'reviewsCount' => count($reviewsData)]
            );
            //Change OverallStatus of order to 'Rated'
            DB::table('ordersbuyer')
                ->where('OrderID', $orderId)
                ->update(['OverallStatus' => 'Rated', 'UpdatedAt' => now()]);
            Log::info('Order status updated to Reviewed for OrderID: ' . $orderId, ['userId' => $userId]);

            // Commit transaction
            DB::commit();
            return response()->json(['success' => true, 'message' => 'Đánh giá đã được gửi thành công!']);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Review save failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['success' => false, 'error' => 'Đã có lỗi xảy ra phía máy chủ.'], 500);
        }
    }
}