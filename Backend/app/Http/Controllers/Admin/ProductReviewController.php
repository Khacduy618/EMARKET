<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\SimpleCollectionExport;
use Illuminate\Validation\ValidationException;
use Throwable;
use Illuminate\Validation\Rule;
use App\Models\Review;

class ProductReviewController extends Controller
{
    /**
     * Lấy danh sách reviews cho trang quản lý của Admin.
     * Hỗ trợ lọc, tìm kiếm và phân trang.
     */
    public function index(Request $request)
    {
        // Validate các tham số đầu vào
        $request->validate([
            'page' => 'integer|min:1',
            'pageSize' => 'integer|min:1|max:100',
            'query' => 'string|nullable',
            'status' => 'string|in:all,pending,approved,rejected,under_review,hidden,flagged',
            'minRating' => 'integer|min:1|max:5',
            'onlyRequests' => 'boolean',
        ]);

        $pageSize = $request->input('pageSize', 10);

        // Bắt đầu xây dựng query
        $query = DB::table('productreviews as pr')
            ->join('users as u', 'pr.UserID', '=', 'u.UserID')
            ->join('productvariants as pv', 'pr.VariantID', '=', 'pv.VariantID')
            ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
            ->join('shops as s', 'p.ShopID', '=', 's.ShopID')
            // LeftJoin để lấy ảnh chính của sản phẩm (nếu có)
            ->leftJoin('productimages as pi', function ($join) {
                $join->on('p.ProductID', '=', 'pi.ProductID')
                     ->where('pi.IsPrimary', '=', 1);
            })
            ->select(
                'pr.ReviewID as id',
                'u.FullName as reviewerName',
                'u.Avatar as reviewerAvatar',
                'pr.Rating as rating',
                'pr.Comment as content',
                DB::raw("DATE_FORMAT(pr.CreatedAt, '%d/%m/%Y %H:%i') as date"),
                'pr.ReviewImages as images',
                'pr.Status as status',
                'p.Name as productName',
                'pi.ImageURL as productImage',
                's.ShopName as shopName',
                's.ShopID as shopId',
                // Tạo object 'requestFromShop'
                DB::raw("CASE WHEN pr.ShopRequestStatus = 'Open' THEN JSON_OBJECT(
                    'open', true,
                    'reason', pr.ShopRequestReason,
                    'createdAt', DATE_FORMAT(pr.ShopRequestAt, '%d/%m/%Y %H:%i')
                ) ELSE JSON_OBJECT('open', false) END as requestFromShop")
            );

        // Áp dụng các bộ lọc
        // 1. Lọc theo từ khóa (query)
        if ($request->filled('query')) {
            $searchTerm = '%' . $request->input('query') . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('s.ShopName', 'LIKE', $searchTerm)
                  ->orWhere('p.Name', 'LIKE', $searchTerm)
                  ->orWhere('u.FullName', 'LIKE', $searchTerm)
                  ->orWhere('pr.Comment', 'LIKE', $searchTerm);
            });
        }

        // 2. Lọc theo trạng thái
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('pr.Status', $request->input('status'));
        }

        // 3. Lọc theo rating tối thiểu
        if ($request->filled('minRating')) {
            $query->where('pr.Rating', '>=', $request->input('minRating'));
        }

        // 4. Lọc theo yêu cầu từ shop
        if ($request->boolean('onlyRequests')) {
            $query->where('pr.ShopRequestStatus', '=', 'Open');
        }

        // Sắp xếp
        $query->orderBy('s.ShopName', 'asc')->orderBy('pr.CreatedAt', 'desc');

        // Phân trang
        $reviews = $query->paginate($pageSize);

        // Xử lý dữ liệu trước khi trả về (ví dụ: parse JSON)
        $reviews->getCollection()->transform(function ($review) {
            // Chuyển chuỗi JSON của ảnh thành mảng
            $review->images = json_decode($review->images, true) ?? [];
            // Chuyển chuỗi JSON của request thành object
            $review->requestFromShop = json_decode($review->requestFromShop);
            return $review;
        });
        
        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }
    /**
     * Cập nhật trạng thái của một review.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Review  $review
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, Review $review)
    {
        // Validate dữ liệu đầu vào
        $validated = $request->validate([
            'status' => [
                'required',
                // Đảm bảo status gửi lên là một trong các giá trị hợp lệ
                Rule::in(['pending', 'approved', 'rejected', 'under_review', 'hidden', 'flagged']),
            ],
            // Thêm validation cho việc xử lý yêu cầu của shop (nếu cần)
            'resolveRequest' => 'boolean|nullable',
        ]);

        // Cập nhật trạng thái chính của review
        $review->Status = $validated['status'];

        // Nếu có cờ 'resolveRequest' được gửi lên, đóng yêu cầu của shop lại
        if ($request->boolean('resolveRequest')) {
            $review->ShopRequestStatus = 'Closed';
        }

        // Lưu thay đổi vào database
        $review->save();

        // Trả về response thành công
        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái review thành công.',
            // Trả về review đã được cập nhật để frontend có thể cập nhật UI
            'data' => $review 
        ]);
    }
}