<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use App\Models\Review; // Giữ lại để dùng cho Route Model Binding

class ProductReviewController extends Controller
{
    /**
     * Lấy danh sách reviews cho trang quản lý của Admin.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'page' => 'integer|min:1',
            'pageSize' => 'integer|min:1|max:100',
            'query' => 'string|nullable',
            'status' => 'string|nullable', // Cho phép nhiều status, ví dụ: 'pending,under_review'
            'minRating' => 'integer|min:1|max:5',
            'onlyRequests' => 'boolean',
        ]);

        $pageSize = $request->input('pageSize', 10);

        $query = DB::table('productreviews as pr')
            ->join('users as u', 'pr.UserID', '=', 'u.UserID')
            ->join('productvariants as pv', 'pr.VariantID', '=', 'pv.VariantID')
            ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
            ->join('shops as s', 'p.ShopID', '=', 's.ShopID')
            ->leftJoin('productimages as pi', function ($join) {
                $join->on('p.ProductID', '=', 'pi.ProductID')->where('pi.IsPrimary', '=', 1);
            })
            ->select(
                'pr.ReviewID as id', 'u.FullName as reviewerName', 'u.Avatar as reviewerAvatar',
                'pr.Rating as rating', 'pr.Comment as content',
                DB::raw("DATE_FORMAT(pr.CreatedAt, '%d/%m/%Y %H:%i') as date"),
                'pr.ReviewImages as images', 'pr.Status as status', 'p.Name as productName',
                'pi.ImageURL as productImage', 's.ShopName as shopName', 's.ShopID as shopId',
                DB::raw("CASE WHEN pr.ShopRequestStatus = 'Open' THEN JSON_OBJECT('open', true, 'reason', pr.ShopRequestReason, 'createdAt', DATE_FORMAT(pr.ShopRequestAt, '%d/%m/%Y %H:%i')) ELSE JSON_OBJECT('open', false) END as requestFromShop")
            );

        if ($request->filled('query')) {
            $searchTerm = '%' . $request->input('query') . '%';
            $query->where(fn($q) => $q->where('s.ShopName', 'LIKE', $searchTerm)
                ->orWhere('p.Name', 'LIKE', $searchTerm)
                ->orWhere('u.FullName', 'LIKE', $searchTerm)
                ->orWhere('pr.Comment', 'LIKE', $searchTerm));
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
             $query->whereIn('pr.Status', explode(',', $request->status));
        }

        if ($request->filled('minRating')) {
            $query->where('pr.Rating', '>=', $request->input('minRating'));
        }

        if ($request->boolean('onlyRequests')) {
            $query->where('pr.ShopRequestStatus', '=', 'Open');
        }

        $query->orderBy('pr.ShopRequestStatus', 'desc')->orderBy('pr.CreatedAt', 'desc');

        $reviews = $query->paginate($pageSize);

        $reviews->getCollection()->transform(function ($review) {
            $review->images = json_decode($review->images, true) ?? [];
            $review->requestFromShop = json_decode($review->requestFromShop);
            $review->productImage = $review->productImage; // Đảm bảo URL đầy đủ nếu cần
            return $review;
        });
        
        return response()->json(['success' => true, 'data' => $reviews]);
    }

    /**
     * Cập nhật trạng thái của một review.
     */
    public function updateStatus(Request $request, Review $review): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['Pending', 'Approved', 'Rejected', 'Needs Attention', 'Hidden'])],
            'resolveRequest' => 'boolean|nullable',
        ]);

        $review->Status = $validated['status'];

        if ($request->boolean('resolveRequest') && $review->ShopRequestStatus === 'Open') {
            $review->ShopRequestStatus = 'Closed';
        }

        $review->save();

        // Trả về review đã được cập nhật để frontend có thể cập nhật UI
        // Lấy lại dữ liệu đã được format để trả về cho nhất quán
        $updatedReviewData = $this->getFormattedReview($review->ReviewID);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái review thành công.',
            'data' => $updatedReviewData
        ]);
    }

  
    /**
     * Hàm helper để lấy dữ liệu chi tiết của 1 review đã được format.
     */
    private function getFormattedReview(int $reviewId)
    {
        $review = DB::table('productreviews as pr')
            ->where('pr.ReviewID', $reviewId)
            // <<< Nối các bảng tương tự như hàm index >>>
            ->join('users as u', 'pr.UserID', '=', 'u.UserID')
            ->join('productvariants as pv', 'pr.VariantID', '=', 'pv.VariantID')
            ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
            ->join('shops as s', 'p.ShopID', '=', 's.ShopID')
            ->leftJoin('productimages as pi', fn($j) => $j->on('p.ProductID', '=', 'pi.ProductID')->where('pi.IsPrimary', 1))
            ->select(
                'pr.ReviewID as id', 'u.FullName as reviewerName', 'u.Avatar as reviewerAvatar',
                'pr.Rating as rating', 'pr.Comment as content',
                DB::raw("DATE_FORMAT(pr.CreatedAt, '%d/%m/%Y %H:%i') as date"),
                'pr.ReviewImages as images', 'pr.Status as status', 'p.Name as productName',
                'pi.ImageURL as productImage', 's.ShopName as shopName', 's.ShopID as shopId',
                DB::raw("CASE WHEN pr.ShopReply IS NOT NULL THEN JSON_OBJECT('content', pr.ShopReply, 'date', DATE_FORMAT(pr.ShopReplyAt, '%d/%m/%Y %H:%i')) ELSE NULL END as shopReply"),
                DB::raw("CASE WHEN pr.ShopRequestStatus = 'Open' THEN JSON_OBJECT('open', true, 'reason', pr.ShopRequestReason, 'createdAt', DATE_FORMAT(pr.ShopRequestAt, '%d/%m/%Y %H:%i')) ELSE JSON_OBJECT('open', false) END as requestFromShop")
            )
            ->first();

        if ($review) {
            $review->images = json_decode($review->images, true) ?? [];
            $review->shopReply = json_decode($review->shopReply);
            $review->requestFromShop = json_decode($review->requestFromShop);
        }
        
        return $review;
    }
}