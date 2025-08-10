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

class ProductReviewController extends Controller
{
    private function checkAdminRole(): ?JsonResponse
    {
        $user = Auth::user();
        if (!$user || $user->Role !== 'Admin') {
            return response()->json(['success' => false, 'message' => 'Không có quyền truy cập.'], 403);
        }
        return null;
    }

    public function index(Request $request): JsonResponse
    {
        if ($error = $this->checkAdminRole()) return $error;
        try {
            $query = DB::table('productreviews as pr')
                ->join('users as u', 'pr.UserID', '=', 'u.UserID')
                ->join('productvariants as pv', 'pr.VariantID', '=', 'pv.VariantID')
                ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
                ->join('shops as s', 'p.ShopID', '=', 's.ShopID')
                ->select(
                    'pr.ReviewID', 'pr.Rating', 'pr.Comment', 'pr.ReviewImages', 'pr.Status', 'pr.CreatedAt', 'pr.ShopReply as AdminReply',
                    'u.UserID', 'u.FullName', 'u.Avatar',
                    'pv.VariantID', 'pv.ImageURL as VariantImageURL',
                    'p.ProductID', 'p.Name as ProductName',
                    's.ShopID', 's.ShopName', 's.LogoURL'
                );

            $this->applyFiltersDb($query, $request);
            
            $reviews = $query->orderBy('pr.CreatedAt', 'desc')->paginate(10); // Thêm phân trang

            $groupedByShop = $reviews->getCollection()->groupBy('ShopID');

            $formattedResult = $groupedByShop->map(function ($reviewsInGroup, $shopId) {
                $firstReview = $reviewsInGroup->first();
                $shopData = [
                    'ShopID' => $shopId,
                    'ShopName' => $firstReview->ShopName ?? "Shop ID: {$shopId}",
                    'LogoURL' => $firstReview->LogoURL,
                ];
                
                return [
                    'shop_info' => $shopData,
                    'reviews' => $this->formatReviewCollectionDb($reviewsInGroup)
                ];
            })->values();
            
            // Trả về dữ liệu theo cấu trúc của phân trang
            return response()->json([
                'success' => true,
                'data' => $formattedResult,
                'pagination' => [
                    'total' => $reviews->total(),
                    'per_page' => $reviews->perPage(),
                    'current_page' => $reviews->currentPage(),
                    'last_page' => $reviews->lastPage(),
                    'from' => $reviews->firstItem(),
                    'to' => $reviews->lastItem(),
                ]
            ]);

        } catch (Throwable $e) {
            Log::error('Admin Review Fetch Error (DB): ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json(['success' => false, 'message' => 'Lỗi server khi lấy danh sách review.'], 500);
        }
    }
    
    public function stats(Request $request): JsonResponse
    {
        if ($error = $this->checkAdminRole()) return $error;
        try {
            $query = DB::table('productreviews as pr');
            
            // Cần join để filter theo tên sản phẩm/user nếu có
            if ($request->filled('search')) {
                 $query->join('users as u', 'pr.UserID', '=', 'u.UserID')
                       ->join('productvariants as pv', 'pr.VariantID', '=', 'pv.VariantID')
                       ->join('products as p', 'pv.ProductID', '=', 'p.ProductID');
            }

            $this->applyFiltersDb($query, $request);

            $statsRaw = $query->select(
                    DB::raw('COUNT(pr.ReviewID) as total'),
                    DB::raw("SUM(CASE WHEN pr.Status = 'Approved' THEN 1 ELSE 0 END) as approved"),
                    DB::raw("SUM(CASE WHEN pr.Status = 'Rejected' THEN 1 ELSE 0 END) as rejected"),
                    DB::raw("SUM(CASE WHEN pr.Status = 'Pending' THEN 1 ELSE 0 END) as pending"),
                    DB::raw("SUM(CASE WHEN pr.Status = 'Needs Attention' THEN 1 ELSE 0 END) as needsAttention") // Sửa tên cột cho khớp frontend
                )->first();

            return response()->json([
                'total' => (int)($statsRaw->total ?? 0),
                'approved' => (int)($statsRaw->approved ?? 0),
                'rejected' => (int)($statsRaw->rejected ?? 0),
                'pending' => (int)($statsRaw->pending ?? 0),
                'needsAttention' => (int)($statsRaw->needsAttention ?? 0), // Sửa key cho khớp
            ]);
        } catch (Throwable $e) {
            Log::error('Error calculating stats (DB): ' . $e->getMessage());
            return response()->json(['message' => 'Lỗi khi tính toán thống kê.'], 500);
        }
    }

    private function updateStatus(int $reviewId, string $status): JsonResponse
    {
        if ($error = $this->checkAdminRole()) return $error;
        try {
            $updated = DB::table('productreviews')->where('ReviewID', $reviewId)->update(['Status' => $status]);
            return $this->getFormattedReviewById($reviewId);
        } catch (Throwable $e) {
            Log::error("Error updating review {$reviewId} to status {$status}: " . $e->getMessage());
            return response()->json(['message' => 'Lỗi server khi cập nhật trạng thái.'], 500);
        }
    }
    
    // Sửa các hàm này để truyền chuỗi status thay vì số
    public function approve(int $reviewId): JsonResponse { return $this->updateStatus($reviewId, 'Approved'); }
    public function reject(int $reviewId): JsonResponse { return $this->updateStatus($reviewId, 'Rejected'); }
    public function setPending(int $reviewId): JsonResponse { return $this->updateStatus($reviewId, 'Pending'); }
    public function setNeedsReview(int $reviewId): JsonResponse { return $this->updateStatus($reviewId, 'Needs Attention'); }
    
    public function reply(Request $request, int $reviewId): JsonResponse
    {
        if ($error = $this->checkAdminRole()) return $error;
        try {
            $validatedData = $request->validate(['replyText' => 'nullable|string|max:2000']);
  DB::table('productreviews')->where('ReviewID', $reviewId)->update([
                'ShopReply' => $validatedData['replyText'], 
                'ShopReplyAt' => now()
            ]);
                        return $this->getFormattedReviewById($reviewId);
        } catch (Throwable $e) {
            Log::error('Error replying to review (DB): ' . $e->getMessage());
            return response()->json(['message' => 'Lỗi server khi phản hồi review.'], 500);
        }
    }

    public function destroy(int $reviewId): JsonResponse
    {
        if ($error = $this->checkAdminRole()) return $error;
        try {
            DB::table('productreviews')->where('ReviewID', $reviewId)->delete();
            return response()->json(null, 204);
        } catch (Throwable $e) {
            Log::error('Error deleting review (DB): ' . $e->getMessage());
            return response()->json(['message' => 'Lỗi khi xóa review.'], 500);
        }
    }
    
    private function applyFiltersDb($query, Request $request): void
    {
        // --- SỬA LOGIC LỌC STATUS ---
        if ($request->filled('status') && $request->status !== 'all') {
            $statusMap = [
                'approved' => 'Approved',
                'rejected' => 'Rejected',
                'pending' => 'Pending',
                'needsAttention' => 'Needs Attention'
            ];
            $statuses = explode(',', $request->status);
            $dbStatuses = [];
            foreach($statuses as $status) {
                if (isset($statusMap[$status])) {
                    $dbStatuses[] = $statusMap[$status];
                }
            }
            if(!empty($dbStatuses)) {
                $query->whereIn('pr.Status', $dbStatuses);
            }
        }
        // Các filter khác
        if ($request->filled('rating') && $request->rating !== 'all') $query->where('pr.Rating', $request->rating);
        if ($request->filled('date_from')) $query->whereDate('pr.CreatedAt', '>=', $request->date_from);
        if ($request->filled('date_to')) $query->whereDate('pr.CreatedAt', '<=', $request->date_to);
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            // Join các bảng cần thiết cho tìm kiếm nếu chưa có
            if (empty($query->joins)) {
                 $query->join('users as u', 'pr.UserID', '=', 'u.UserID')
                       ->join('productvariants as pv', 'pr.VariantID', '=', 'pv.VariantID')
                       ->join('products as p', 'pv.ProductID', '=', 'p.ProductID');
            }
            $query->where(function ($q) use ($searchTerm) {
                $q->where('pr.Comment', 'like', "%{$searchTerm}%")
                  ->orWhere('u.FullName', 'like', "%{$searchTerm}%")
                  ->orWhere('p.Name', 'like', "%{$searchTerm}%");
            });
        }
    }

    private function formatReviewCollectionDb($reviews)
    {
        $variantIds = $reviews->pluck('VariantID')->filter()->unique();
        if ($variantIds->isEmpty()) {
            return $reviews->map(fn($r) => $this->mapReviewObject($r));
        }
        $attributesData = DB::table('productvariantattribute as pva')
            ->join('attributevalues as av', 'pva.AttributeValueID', '=', 'av.AttributeValueID')
            ->whereIn('pva.VariantID', $variantIds)
            ->select('pva.VariantID', 'av.Value')
            ->get()->groupBy('VariantID');

        return $reviews->map(function ($review) use ($attributesData) {
            $variantAttributes = $attributesData->get($review->VariantID, collect());
            return $this->mapReviewObject($review, $variantAttributes->pluck('Value')->implode(', '));
        });
    }

    private function getFormattedReviewById(int $reviewId): JsonResponse
    {
        $review = DB::table('productreviews as pr')
            ->where('pr.ReviewID', $reviewId)
            ->join('users as u', 'pr.UserID', '=', 'u.UserID')
            ->join('productvariants as pv', 'pr.VariantID', '=', 'pv.VariantID')
            ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
            ->select(
                'pr.ReviewID', 'pr.Rating', 'pr.Comment', 'pr.ReviewImages', 'pr.Status', 'pr.CreatedAt', 'pr.ShopReply as AdminReply', 
                'pv.VariantID', 'pv.ImageURL as VariantImageURL',
                'p.ProductID', 'p.Name as ProductName'
            )->first();
            
        if(!$review) return response()->json(['message' => 'Review not found'], 404);

        $attributes = DB::table('productvariantattribute as pva')
            ->join('attributevalues as av', 'pva.AttributeValueID', '=', 'av.AttributeValueID')
            ->where('pva.VariantID', $review->VariantID)
            ->pluck('av.Value');

        return response()->json($this->mapReviewObject($review, $attributes->implode(', ')));
    }

    // --- Cập nhật hàm map để khớp với interface frontend ---
    private function mapReviewObject($review, $classification = '')
    {
        $statusMap = ['Approved' => 1, 'Rejected' => 0, 'Pending' => 2, 'Needs Attention' => 3];
        
        return [
            'ReviewID' => $review->ReviewID,
            'Rating' => (int) $review->Rating,
            'Comment' => $review->Comment,
            'ReviewImages' => json_decode($review->ReviewImages), // Decode JSON string
            'status' => $statusMap[$review->Status] ?? null, // Map chuỗi sang số
            'CreatedAt' => $review->CreatedAt,
            'AdminReply' => $review->AdminReply, 
            'user' => [
                'UserID' => $review->UserID,
                'FullName' => $review->FullName,
                'Avatar' => $review->Avatar,
            ],
            'variant' => [
                'VariantID' => $review->VariantID,
                'ImageURL' => $review->VariantImageURL,
                'product' => [
                    'ProductID' => $review->ProductID,
                    'Name' => $review->ProductName,
                ],
                'VariantAttributes' => $classification
            ],
        ];
    }
}