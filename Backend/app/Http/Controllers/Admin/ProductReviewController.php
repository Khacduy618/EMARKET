<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\SimpleCollectionExport;
use Throwable;

class ProductReviewController extends Controller
{
    /**
     * Hàm helper private để kiểm tra quyền Admin một cách nhất quán.
     */
    private function checkAdminRole(): ?JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        if (trim((string) data_get($user, 'Role')) !== 'Admin') {
            Log::warning('Authorization_Failed: Non-admin user attempted an admin action.', [
                'user_id' => $user->UserID,
                'user_role_received' => data_get($user, 'Role'),
                'expected_role' => 'Admin',
                'route' => request()->path(),
            ]);
            return response()->json(['success' => false, 'message' => 'Không có quyền truy cập.'], 403);
        }

        return null; // Trả về null nếu user là Admin
    }

    /**
     * Lấy danh sách review cho trang Admin, gom nhóm theo Shop.
     */
    public function index(Request $request): JsonResponse
    {
        if ($error = $this->checkAdminRole()) return $error;

        try {
            $query = ProductReview::with(['user', 'variant.product.shop']);
            $this->applyFilters($query, $request);
            $reviews = $query->orderBy('CreatedAt', 'desc')->get();

            $groupedByShop = $reviews->groupBy(function ($review) {
                return data_get($review, 'variant.product.shop.ShopID', 'data_error');
            });

            $shopIds = $groupedByShop->keys()->filter(fn($id) => is_numeric($id));
            $shopsInfo = $shopIds->isNotEmpty() ? Shop::whereIn('ShopID', $shopIds)->get()->keyBy('ShopID') : collect();

            $formattedResult = $groupedByShop->map(function ($reviewsInGroup, $shopId) use ($shopsInfo) {
                $shopData = ['ShopID' => null, 'ShopName' => 'Lỗi dữ liệu (Sản phẩm/Shop không tồn tại)', 'LogoURL' => null];
                if (is_numeric($shopId)) {
                    $shop = $shopsInfo->get($shopId);
                    if ($shop) {
                        $shopData = ['ShopID' => $shop->ShopID, 'ShopName' => $shop->ShopName, 'LogoURL' => $shop->LogoURL];
                    } else {
                        $shopData['ShopName'] = "Cửa hàng ID: {$shopId} (đã bị xóa)";
                    }
                }
                return ['shop_info' => $shopData, 'reviews' => $this->formatReviewCollection($reviewsInGroup)];
            })->values();

            return response()->json(['success' => true, 'data' => $formattedResult], 200, [], JSON_INVALID_UTF8_SUBSTITUTE);

        } catch (Throwable $e) {
            Log::error('Admin Review Fetch Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['success' => false, 'message' => 'Lỗi server khi lấy danh sách review.'], 500);
        }
    }

    /**
     * Lấy các số liệu thống kê về review.
     */
    public function stats(): JsonResponse
    {
        if ($error = $this->checkAdminRole()) return $error;
        try {
            $statsRaw = ProductReview::query()
                ->select(
                    DB::raw('COUNT(*) as total'),
                    DB::raw("SUM(CASE WHEN IsApproved = 1 THEN 1 ELSE 0 END) as approved"),
                    DB::raw("SUM(CASE WHEN IsApproved = 0 THEN 1 ELSE 0 END) as rejected"),
                    DB::raw("SUM(CASE WHEN IsApproved IS NULL THEN 1 ELSE 0 END) as pending")
                )->first();
            return response()->json([
                'total' => (int)($statsRaw->total ?? 0), 'approved' => (int)($statsRaw->approved ?? 0),
                'rejected' => (int)($statsRaw->rejected ?? 0), 'pending' => (int)($statsRaw->pending ?? 0),
            ]);
        } catch (Throwable $e) {
            Log::error('Error calculating stats: ' . $e->getMessage());
            return response()->json(['message' => 'Lỗi khi tính toán thống kê.'], 500);
        }
    }

    /**
     * Duyệt một review. (PHIÊN BẢN CUỐI CÙNG)
     */
    public function approve(ProductReview $review): JsonResponse
    {
        if ($error = $this->checkAdminRole()) return $error;
        try {
            $review->update(['IsApproved' => true]);
            return $this->createSafeJsonResponse($review);
        } catch (Throwable $e) {
            Log::error('Error approving review: ' . $e->getMessage(), ['review_id' => $review->ReviewID, 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Lỗi server khi duyệt review.'], 500);
        }
    }

    /**
     * Từ chối một review. (PHIÊN BẢN CUỐI CÙNG)
     */
    public function reject(ProductReview $review): JsonResponse
    {
        if ($error = $this->checkAdminRole()) return $error;
        try {
            $review->update(['IsApproved' => false]);
            return $this->createSafeJsonResponse($review);
        } catch (Throwable $e) {
            Log::error('Error rejecting review: ' . $e->getMessage(), ['review_id' => $review->ReviewID, 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Lỗi server khi từ chối review.'], 500);
        }
    }

    /**
     * Phản hồi một review. (PHIÊN BẢN CUỐI CÙNG)
     */
    public function reply(Request $request, ProductReview $review): JsonResponse
    {
        if ($error = $this->checkAdminRole()) return $error;
        $validatedData = $request->validate(['replyText' => 'required|string|max:2000']);
        try {
            $review->update(['AdminReply' => $validatedData['replyText']]);
            return $this->createSafeJsonResponse($review);
        } catch (Throwable $e) {
            Log::error('Error replying to review: ' . $e->getMessage());
            return response()->json(['message' => 'Lỗi khi phản hồi review.'], 500);
        }
    }

    /**
     * Xóa một review.
     */
    public function destroy(ProductReview $review): JsonResponse
    {
        if ($error = $this->checkAdminRole()) return $error;
        try {
            $review->delete();
            return response()->json(null, 204);
        } catch (Throwable $e) {
            Log::error('Error deleting review: ' . $e->getMessage());
            return response()->json(['message' => 'Lỗi khi xóa review.'], 500);
        }
    }

    /**
     * Xuất danh sách review ra file Excel.
     */
    public function export(Request $request)
    {
        if ($error = $this->checkAdminRole()) return $error;
        try {
            $query = ProductReview::with(['user', 'variant.product.shop']);
            $this->applyFilters($query, $request);
            $reviewsToExport = $query->orderByDesc('CreatedAt')->get();
            $dataForExport = $reviewsToExport->map(function ($review) {
                return [
                    'ID' => $review->ReviewID, 'Người đánh giá' => data_get($review, 'user.FullName', 'N/A'),
                    'Email' => data_get($review, 'user.Email', 'N/A'), 'Cửa hàng' => data_get($review, 'variant.product.shop.ShopName', 'N/A'),
                    'Sản phẩm' => data_get($review, 'variant.product.Name', 'Sản phẩm đã xóa'), 'SKU Biến thể' => data_get($review, 'variant.SKU', 'N/A'),
                    'Rating' => $review->Rating, 'Bình luận' => $review->Comment,
                    'Trạng thái' => $review->IsApproved ? 'Đã duyệt' : ($review->IsApproved === false ? 'Từ chối' : 'Chờ duyệt'),
                    'Ngày tạo' => $review->CreatedAt->format('d-m-Y H:i:s'),
                ];
            });
            return Excel::download(new SimpleCollectionExport($dataForExport), 'danh-sach-reviews-' . date('Y-m-d') . '.xlsx');
        } catch (Throwable $e) {
            Log::error('Error exporting reviews to Excel: ' . $e->getMessage());
            return response()->json(['message' => 'Không thể xuất file Excel do lỗi server.'], 500);
        }
    }

    /**
     * Hàm helper để áp dụng các bộ lọc.
     */
    private function applyFilters($query, Request $request): void
    {
        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'approved') $query->where('IsApproved', 1);
            if ($request->status === 'rejected') $query->where('IsApproved', 0);
            if ($request->status === 'pending') $query->whereNull('IsApproved');
        }
        if ($request->filled('rating') && $request->rating !== 'all') {
            $query->where('Rating', $request->rating);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('CreatedAt', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('CreatedAt', '<=', $request->date_to);
        }
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('Comment', 'like', "%{$searchTerm}%")
                  ->orWhereHas('user', fn($uq) => $uq->where('FullName', 'like', "%{$searchTerm}%"))
                  ->orWhereHas('variant.product', fn($pq) => $pq->where('Name', 'like', "%{$searchTerm}%"));
            });
        }
    }

    /**
     * Hàm helper để định dạng collection review.
     */
    private function formatReviewCollection($reviews)
    {
        $variantIds = $reviews->pluck('variant.VariantID')->filter()->unique();
        if ($variantIds->isEmpty()) {
            return $reviews;
        }
        $attributesData = DB::table('productvariantattribute as pva')
            ->join('attributevalues as av', 'pva.AttributeValueID', '=', 'av.AttributeValueID')
            ->join('attributes as a', 'av.AttributeID', '=', 'a.AttributeID')
            ->whereIn('pva.VariantID', $variantIds)
            ->select('pva.VariantID', 'a.Name', 'av.Value')
            ->get()->groupBy('VariantID');

        return $reviews->map(function ($review) use ($attributesData) {
            $variant = optional($review)->variant;
            if ($variant && $attributesData->has($variant->VariantID)) {
                $variant->VariantAttributes = $attributesData->get($variant->VariantID)
                    ->map(fn ($attr) => "{$attr->Name}: {$attr->Value}")
                    ->implode(' | ');
            }
            return $review;
        });
    }

    /**
     * Hàm helper để định dạng một review đơn lẻ.
     */
    private function formatSingleReview(ProductReview $review)
    {
        $variant = optional($review)->variant;
        if ($variant) {
            $attributesData = DB::table('productvariantattribute as pva')
                ->join('attributevalues as av', 'pva.AttributeValueID', '=', 'av.AttributeValueID')
                ->join('attributes as a', 'av.AttributeID', '=', 'a.AttributeID')
                ->where('pva.VariantID', $variant->VariantID)
                ->select('a.Name', 'av.Value')
                ->get();

            $variant->VariantAttributes = $attributesData
                ->map(fn ($attr) => "{$attr->Name}: {$attr->Value}")
                ->implode(' | ');
        }
        return $review;
    }

    /**
     * Hàm helper mới để tạo JSON response an toàn, tránh lỗi mã hóa.
     */
    private function createSafeJsonResponse(ProductReview $review): JsonResponse
    {
        $review->loadMissing(['user', 'variant.product.shop']);
        $formattedReview = $this->formatSingleReview($review);
        $reviewArray = $formattedReview->toArray();
        return response()->json($reviewArray, 200, [], JSON_INVALID_UTF8_SUBSTITUTE);
    }
}