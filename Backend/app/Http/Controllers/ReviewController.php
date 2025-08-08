<?php

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