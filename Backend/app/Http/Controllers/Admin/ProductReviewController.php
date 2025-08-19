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
    public function index(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'page' => 'integer|min:1',
                'pageSize' => 'integer|min:1|max:100',
                'query' => 'string|nullable',
                'status' => ['nullable', 'string', Rule::in(['pending', 'approved', 'rejected', 'under_review', 'hidden', 'flagged'])],
                'minRating' => 'integer|min:1|max:5',
                'onlyRequests' => 'boolean',
            ]);

            $pageSize = $request->input('pageSize', 10);
            
            $query = Review::with([
                'user:UserID,FullName,Avatar',
                'variant.product:ProductID,Name,ShopID',
                'variant.product.shop:ShopID,ShopName',
                'variant.product.primaryImage:ProductImageID,ProductID,ImageURL'
            ]);

            if ($request->filled('query')) {
                $searchTerm = $request->input('query');
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('Comment', 'LIKE', "%{$searchTerm}%")
                      ->orWhereHas('user', fn($userQuery) => $userQuery->where('FullName', 'LIKE', "%{$searchTerm}%"))
                      ->orWhereHas('variant.product', fn($prodQuery) => $prodQuery->where('Name', 'LIKE', "%{$searchTerm}%"))
                      ->orWhereHas('variant.product.shop', fn($shopQuery) => $shopQuery->where('ShopName', 'LIKE', "%{$searchTerm}%"));
                });
            }

            if ($request->filled('status') && $request->input('status') !== 'all') {
                $query->where('Status', $request->input('status'));
            }

            if ($request->filled('minRating')) {
                $query->where('Rating', '>=', $request->input('minRating'));
            }

            if ($request->boolean('onlyRequests')) {
                $query->where('ShopRequestStatus', 'Open');
            }

            $query->orderBy('CreatedAt', 'desc');

            $reviews = $query->paginate($pageSize);
            
            return response()->json(['success' => true, 'data' => $reviews]);

        } catch (ValidationException $e) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy danh sách reviews: ' . $e->getMessage());
            return response()->json(['message' => 'Lỗi server khi lấy danh sách reviews.'], 500);
        }
    }

    public function updateStatus(Request $request, Review $review): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(['pending', 'approved', 'rejected', 'under_review', 'hidden', 'flagged'])],
            'resolveRequest' => 'boolean|nullable',
        ]);

        try {
            $review->Status = $validated['status'];
            if ($request->boolean('resolveRequest')) {
                $review->ShopRequestStatus = 'Closed';
            }
            $review->save();

            $review->load('user', 'variant.product.shop', 'variant.product.primaryImage');
            
            $formattedReview = [
                'id' => $review->ReviewID,
                'reviewerName' => $review->user->FullName,
                'reviewerAvatar' => $review->user->Avatar,
                'rating' => $review->Rating,
                'content' => $review->Comment,
                'date' => $review->created_at->format('d/m/Y H:i'),
                'images' => $review->ReviewImages,
                'status' => $review->Status,
                'productName' => $review->variant->product->Name,
                'productImage' => $review->variant->product->primaryImage->ImageURL ?? null,
                'shopName' => $review->variant->product->shop->ShopName,
                'shopId' => $review->variant->product->shop->ShopID,
                'requestFromShop' => [
                    'open' => $review->ShopRequestStatus === 'Open',
                    'reason' => $review->ShopRequestReason,
                    'createdAt' => $review->ShopRequestAt ? $review->ShopRequestAt->format('d/m/Y H:i') : null
                ]
            ];

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật trạng thái review thành công.',
                'data' => $formattedReview
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi khi cập nhật trạng thái review ID ' . $review->ReviewID . ': ' . $e->getMessage());
            return response()->json(['message' => 'Cập nhật trạng thái thất bại.'], 500);
        }
    }

    public function getStats(): JsonResponse
    {
        try {
            $stats = [
                'total' => Review::count(),
                'pending' => Review::where('Status', 'pending')->count(),
                'requests' => Review::where('ShopRequestStatus', 'Open')->count(),
            ];
            return response()->json($stats);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy thống kê reviews: ' . $e->getMessage());
            return response()->json(['message' => 'Không thể lấy thống kê.'], 500);
        }
    }
    
    public function bulkUpdateStatus(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reviewIds' => 'required|array|min:1',
            'reviewIds.*' => 'integer|exists:productreviews,ReviewID',
            'status' => ['required', 'string', Rule::in(['approved', 'rejected', 'hidden'])],
        ]);

        try {
            Review::whereIn('ReviewID', $validated['reviewIds'])
                  ->update(['Status' => $validated['status']]);

            return response()->json(['success' => true, 'message' => 'Cập nhật hàng loạt thành công!']);
        } catch (\Exception $e) {
            Log::error('Lỗi khi cập nhật reviews hàng loạt: ' . $e->getMessage());
            return response()->json(['message' => 'Cập nhật hàng loạt thất bại.'], 500);
        }
    }
    
    public function export(Request $request)
    {
        $filters = $request->all();
        $fileName = 'danh-sach-danh-gia-' . now()->format('d-m-Y') . '.xlsx';
        return Excel::download(new ReviewsExport($filters), $fileName);
    }
}