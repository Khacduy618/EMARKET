<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    const REVIEW_EXPIRATION_DAYS = 3; // Số ngày sau khi giao hàng để có thể đánh giá
    
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'SellerOrderID' => 'required|integer|exists:ordersseller,SellerOrderID',
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

        $sellerOrderID = $request->input('SellerOrderID');
        $reviewsData = json_decode($request->input('reviews'), true);
        $userId = Auth::id();

        if (!is_array($reviewsData)) {
            return response()->json(['success' => false, 'error' => 'Định dạng dữ liệu đánh giá không hợp lệ.'], 400);
        }

        $order = DB::table('ordersseller as os')
        ->join('ordersbuyer as ob', 'os.OrderID', '=', 'ob.OrderID')
        ->where('os.SellerOrderID', $sellerOrderID)
        ->where('ob.UserID', $userId) // Kiểm tra UserID từ bảng ordersbuyer
        ->select('os.Status') // Chỉ cần lấy trạng thái
        ->first();
        if (!$order) {
            return response()->json(['success' => false, 'error' => 'Đơn hàng không tồn tại hoặc bạn không có quyền đánh giá.'], 403);
        }
        // Kiểm tra xem đơn hàng đã được đánh giá chưa
            if ($order->Status === 'Rated') {
                return response()->json(['success' => false, 'error' => 'Đơn hàng này đã được đánh giá.'], 409); // 409 Conflict
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
                    ->where('SellerOrderID', $sellerOrderID)
                    ->first();

                if (!$orderItem) {
                    Log::warning("Attempt to review invalid OrderItemID {$orderItemId} for SellerOrderID {$sellerOrderID}");
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
                    'SellerOrderID' => $sellerOrderID,
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
            Log::info('All reviews saved successfully for SellerOrderID: ' . $sellerOrderID,
                ['userId' => $userId, 'reviewsCount' => count($reviewsData)]
            );
            //Change OverallStatus of order to 'Rated'
            DB::table('ordersseller')
                ->where('SellerOrderID', $sellerOrderID)
                ->update(['Status' => 'Rated', 'UpdatedAt' => now()]);
            Log::info('Order status updated to Reviewed for SellerOrderID: ' .$sellerOrderID , ['userId' => $userId]);

            // Commit transaction
            DB::commit();
            return response()->json(['success' => true, 'message' => 'Đánh giá đã được gửi thành công!']);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Review save failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['success' => false, 'error' => 'Đã có lỗi xảy ra phía máy chủ.'], 500);
        }
    }

    /**
     * Cho phép chủ shop trả lời một đánh giá.
     */
    public function reply(Request $request, $reviewId)
    {
        $validator = Validator::make($request->all(), [
            'reply_content' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()], 422);
        }

        $user = Auth::user();

        // 1. Tìm đánh giá và sản phẩm liên quan
        $review = DB::table('productreviews')
            ->join('productvariants', 'productreviews.VariantID', '=', 'productvariants.VariantID')
            ->join('products', 'productvariants.ProductID', '=', 'products.ProductID')
            ->where('productreviews.ReviewID', $reviewId)
            ->select('productreviews.*', 'products.ShopID')
            ->first();

        if (!$review) {
            return response()->json(['success' => false, 'error' => 'Không tìm thấy đánh giá.'], 404);
        }

        // 2. Kiểm tra quyền: Người dùng hiện tại có phải là chủ của shop này không?
        $shop = DB::table('shops')->where('UserID', $user->UserID)->first();

        if (!$shop || $shop->ShopID !== $review->ShopID) {
            return response()->json(['success' => false, 'error' => 'Bạn không có quyền trả lời đánh giá này.'], 403);
        }

        // 3. Cập nhật phản hồi vào CSDL
        try {
            DB::table('productreviews')
                ->where('ReviewID', $reviewId)
                ->update([
                    'ShopReply' => $request->input('reply_content'),
                    'UpdatedAt' => now(), // Cập nhật thời gian
                    'ShopReplyAt' => now(), // Thêm thời gian phản hồi
                ]);

            return response()->json(['success' => true, 'message' => 'Phản hồi đã được gửi.']);

        } catch (\Exception $e) {
            Log::error('Failed to save shop reply', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'error' => 'Đã có lỗi xảy ra.'], 500);
        }
    }

    public function getReviewSummary(Request $request)
    {
        $userId = Auth::id();if (!$userId) {
            return response()->json(['success' => false, 'error' => 'Unauthorized'], 401);
        }

        try {
            // --- 1. Lấy danh sách sản phẩm CHƯA ĐÁNH GIÁ ---
            $toReviewItems = DB::table('orderitems as oi')
                ->join('ordersseller as os', 'oi.SellerOrderID', '=', 'os.SellerOrderID')
                ->join('ordersbuyer as ob', 'os.OrderID', '=', 'ob.OrderID')
                ->join('shops as s', 'os.ShopID', '=', 's.ShopID')
                ->join('productvariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
                ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
                ->leftJoin('productimages as pi', function($join) {
                    $join->on('p.ProductID', '=', 'pi.ProductID')->where('pi.IsPrimary', '=', 1);
                })
                ->leftJoin('productreviews as pr', 'oi.OrderItemID', '=', 'pr.OrderItemID')
                ->where('ob.UserID', $userId)
                ->whereIn('os.Status', ['Delivered', 'Completed'])
                ->whereNull('pr.ReviewID')
                ->whereNotNull('os.DeliveredAt') // Đảm bảo đã có ngày giao hàng
                ->where('os.DeliveredAt', '>=', now()->subDays(self::REVIEW_EXPIRATION_DAYS)) // Điều kiện hết hạn
                ->select(
                    'os.SellerOrderID', 'oi.OrderItemID', 'ob.OrderDate', 's.ShopName',
                    'p.Name as ProductName', 'pi.ImageURL as ProductImage'
                )
                ->distinct()
                ->get();

            // --- 2. Lấy danh sách sản phẩm ĐÃ ĐÁNH GIÁ ---
            $reviewedItems = DB::table('productreviews as pr')
                ->join('orderitems as oi', 'pr.OrderItemID', '=', 'oi.OrderItemID')
                ->join('productvariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
                ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
                ->leftJoin('productimages as pi', function($join) {
                    $join->on('p.ProductID', '=', 'pi.ProductID')->where('pi.IsPrimary', '=', 1);
                })
                ->where('pr.UserID', $userId)
                ->select(
                    'pr.ReviewID', 'pr.Rating', 'pr.Comment', 'pr.ReviewImages',
                    'pr.ShopReply', 'p.Name as ProductName', 'pi.ImageURL as ProductImage'
                )
                ->orderBy('pr.CreatedAt', 'desc')
                ->get();

            // --- 3. Định dạng lại dữ liệu cho Frontend ---
            $formattedToReview = $toReviewItems->map(function ($item) {
                return [
                    'SellerOrderID' => $item->SellerOrderID,
                    'OrderItemID' => $item->OrderItemID,
                    'OrderDate' => $item->OrderDate,
                    'ShopName' => $item->ShopName,
                    'product' => [
                        'name' => $item->ProductName,'image' => $item->ProductImage,
                    ]
                ];
            })->values();

            $formattedReviewed = $reviewedItems->map(function ($item) {
                return [
                    'ReviewID' => $item->ReviewID,
                    'Rating' => $item->Rating,
                    'Comment' => $item->Comment,
                    'ReviewImages' => json_decode($item->ReviewImages),
                    'ShopReply' => $item->ShopReply,
                    'product' => [
                        'name' => $item->ProductName,
                        'image' => $item->ProductImage,
                    ]
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'to_review' => $formattedToReview,
                    'reviewed' => $formattedReviewed
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get review summary for user ' . $userId, ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'error' => 'Đã có lỗi xảy ra phía máy chủ.'], 500);
        }
    }
}