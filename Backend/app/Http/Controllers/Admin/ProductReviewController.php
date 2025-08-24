<?php


namespace App\Http\Controllers\Admin;


use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use App\Models\ProductReview;


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
           'status' => 'string|nullable',
           'rating' => 'integer|min:1|max:5|nullable', // Đã đổi tên từ minRating
           'onlyRequests' => 'boolean',
           'shop_id' => 'integer|nullable',
           'start_date' => 'date_format:Y-m-d|nullable',
           'end_date' => 'date_format:Y-m-d|nullable|after_or_equal:start_date',
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
               DB::raw("CASE WHEN pr.ShopReply IS NOT NULL THEN JSON_OBJECT('content', pr.ShopReply, 'date', DATE_FORMAT(pr.ShopReplyAt, '%d/%m/%Y %H:%i')) ELSE NULL END as shopReply"),
               DB::raw("CASE WHEN pr.ShopRequestStatus = 'Open' THEN JSON_OBJECT('open', true, 'reason', pr.ShopRequestReason, 'createdAt', DATE_FORMAT(pr.ShopRequestAt, '%d/%m/%Y %H:%i')) ELSE JSON_OBJECT('open', false) END as requestFromShop")
           );


       if ($request->filled('query')) {
           $searchTerm = '%' . $request->input('query') . '%';
           $query->where(function($q) use ($searchTerm) {
               $q->where('s.ShopName', 'LIKE', $searchTerm)
                 ->orWhere('p.Name', 'LIKE', $searchTerm)
                 ->orWhere('u.FullName', 'LIKE', $searchTerm)
                 ->orWhere('pr.Comment', 'LIKE', $searchTerm);
           });
       }


       if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->whereIn('pr.Status', explode(',', $request->input('status')));
       }
      
       // --- LOGIC LỌC RATING ĐÃ ĐƯỢC THAY ĐỔI ---
       if ($request->filled('rating')) {
           $query->where('pr.Rating', '=', $request->input('rating'));
       }


       if ($request->boolean('onlyRequests')) {
           $query->where('pr.ShopRequestStatus', '=', 'Open');
       }


       if ($request->filled('shop_id')) {
           $query->where('p.ShopID', $request->input('shop_id'));
       }


       if ($request->filled('start_date')) {
           $query->whereDate('pr.CreatedAt', '>=', $request->input('start_date'));
       }


       if ($request->filled('end_date')) {
           $query->whereDate('pr.CreatedAt', '<=', $request->input('end_date'));
       }
      
       $query->orderBy('pr.ShopRequestStatus', 'desc')->orderBy('pr.CreatedAt', 'desc');


       $reviews = $query->paginate($pageSize);


       $reviews->getCollection()->transform(function ($review) {
           $review->images = json_decode($review->images, true) ?? [];
           $review->shopReply = json_decode($review->shopReply);
           $review->requestFromShop = json_decode($review->requestFromShop);
           return $review;
       });
      
       return response()->json(['success' => true, 'data' => $reviews]);
   }


   /**
    * Cập nhật trạng thái của một review.
    */
   public function updateStatus(Request $request, ProductReview $review): JsonResponse
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


   /**
    * Lấy danh sách các cửa hàng để dùng trong bộ lọc của trang Admin.
    */
   public function getShopFilters(): JsonResponse
   {
       $shops = DB::table('shops')
           ->where('Status', 'Approved')
           ->select('ShopID', 'ShopName')
           ->orderBy('ShopName', 'asc')
           ->get();


       return response()->json($shops);
   }
}
