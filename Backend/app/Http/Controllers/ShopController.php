<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ShopController extends Controller
{
    public function show($shopId, Request $request)
    {
        // --- 1. Lấy thông tin cơ bản của Shop ---
        $shop = DB::table('shops')->where('ShopID', $shopId)->first();

        if (!$shop) {
            return response()->json(['message' => 'Shop not found'], 404);
        }

        // --- 2. Lấy các thông tin tổng hợp ---
        $followersCount = DB::table('shopfollows')->where('ShopID', $shopId)->count();
        
        $productsCount = DB::table('products')
            ->where('ShopID', $shopId)
            ->where('IsActive', true)
            ->where('AdminApprovalStatus', 'Approved')
            ->count();
        
        $isFollowing = false;
        if (Auth::guard('sanctum')->check()) {
            $isFollowing = DB::table('shopfollows')
                ->where('ShopID', $shopId)
                ->where('UserID', Auth::guard('sanctum')->id())
                ->exists();
        }

        // Lấy rating trung bình và số lượng đánh giá của toàn shop
        $shopRatingStats = DB::table('productreviews as pr')
            ->join('productvariants as pv', 'pr.VariantID', '=', 'pv.VariantID')
            ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
            ->where('p.ShopID', $shopId)
            ->selectRaw('AVG(pr.Rating) as rating, COUNT(pr.ReviewID) as ratingCount')
            ->first();

        $shopInfo = [
            'id' => $shop->ShopID,
            'name' => $shop->ShopName,
            'avatar' => $shop->LogoURL,
            'banner' => $shop->CoverImageURL,
            'rating' => (float) ($shopRatingStats->rating ?? 0),
            'ratingCount' => (int) ($shopRatingStats->ratingCount ?? 0),
            'followers' => $followersCount,
            'productsCount' => $productsCount,
            'isFollowing' => $isFollowing,
            'isVerified' => $shop->Level === 'Mall',
            'joinedAt' => Carbon::parse($shop->updated_at)->locale('vi')->diffForHumans(),
            'chatResponseRate' => 98,
            'responseSpeed' => "trong vài giờ",
            'onTimeDeliveryRate' => 99,
        ];

        // --- 3. Lấy danh mục sản phẩm của shop ---
        $categoryCounts = DB::table('products')
            ->select('CategoryID', DB::raw('COUNT(ProductID) as product_count'))
            ->where('ShopID', $shopId)
            ->where('IsActive', true)
            ->where('AdminApprovalStatus', 'Approved')
            ->groupBy('CategoryID')
            ->get();
        
        $categoryIds = $categoryCounts->pluck('CategoryID');
        
        $categoryDetails = DB::table('platformcategories')
            ->whereIn('CategoryID', $categoryIds)
            ->get()
            ->keyBy('CategoryID');

        $categories = $categoryCounts->map(function ($item) use ($categoryDetails) {
            $detail = $categoryDetails->get($item->CategoryID);
            return [
                'key' => (string)$item->CategoryID,
                'label' => $detail ? $detail->Name : 'Không xác định',
                'count' => $item->product_count,
            ];
        });
        $categories->prepend(['key' => 'all', 'label' => 'Tất cả', 'count' => $productsCount]);

        // --- 4. Lấy danh sách sản phẩm ---
        $productQuery = DB::table('products as p')
            ->select('p.ProductID', 'p.Name', 'p.SoldCount', 'p.CreatedAt', 'p.CategoryID')
            // Subquery để lấy giá thấp nhất từ các biến thể
            ->selectSub(function ($query) {
                $query->from('productvariants')
                    ->select('Price')
                    ->whereColumn('ProductID', 'p.ProductID')
                    ->orderBy('Price', 'asc')
                    ->limit(1);
            }, 'price')
            // Subquery để lấy giá gốc tương ứng
            ->selectSub(function ($query) {
                $query->from('productvariants')
                    ->select('CompareAtPrice')
                    ->whereColumn('ProductID', 'p.ProductID')
                    ->orderBy('Price', 'asc')
                    ->limit(1);
            }, 'originalPrice')
            // Subquery để lấy ảnh chính
            ->selectSub(function ($query) {
                $query->from('productimages')
                    ->select('ImageURL')
                    ->whereColumn('ProductID', 'p.ProductID')
                    ->where('IsPrimary', true)
                    ->limit(1);
            }, 'image')
            ->where('p.ShopID', $shopId)
            ->where('p.IsActive', true)
            ->where('p.AdminApprovalStatus', 'Approved');

        // Áp dụng các bộ lọc
        if ($request->filled('q')) {
            $productQuery->where('p.Name', 'like', '%' . $request->input('q') . '%');
        }
        if ($request->filled('category') && $request->input('category') !== 'all') {
            $productQuery->where('p.CategoryID', $request->input('category'));
        }
        if ($request->filled('priceMin') || $request->filled('priceMax')) {
            $productQuery->whereExists(function ($query) use ($request) {
                $query->from('productvariants as pv_filter')
                      ->whereColumn('pv_filter.ProductID', 'p.ProductID');
                if ($request->filled('priceMin')) {
                    $query->where('pv_filter.Price', '>=', $request->input('priceMin'));
                }
                if ($request->filled('priceMax')) {
                    $query->where('pv_filter.Price', '<=', $request->input('priceMax'));
                }
            });
        }
        
        // Sắp xếp
        $sortBy = $request->input('sortBy', 'popular');
        switch ($sortBy) {
            case 'newest': $productQuery->orderBy('p.CreatedAt', 'desc'); break;
            case 'price-asc': $productQuery->orderBy('price', 'asc'); break;
            case 'price-desc': $productQuery->orderBy('price', 'desc'); break;
            case 'popular': default: $productQuery->orderBy('p.SoldCount', 'desc'); break;
        }

        $paginatedProducts = $productQuery->paginate(20);

        // Lấy rating cho các sản phẩm đã được phân trang
        $productIds = $paginatedProducts->pluck('ProductID');
        $productRatings = DB::table('productreviews as pr')
            ->join('productvariants as pv', 'pr.VariantID', '=', 'pv.VariantID')
            ->whereIn('pv.ProductID', $productIds)
            ->select('pv.ProductID', DB::raw('AVG(pr.Rating) as rating, COUNT(pr.ReviewID) as ratingCount'))
            ->groupBy('pv.ProductID')
            ->get()
            ->keyBy('ProductID');
        
        // Map rating vào kết quả cuối cùng
        $products = $paginatedProducts->getCollection()->map(function ($p) use ($productRatings) {
            $ratingData = $productRatings->get($p->ProductID);
            return [
                'id' => $p->ProductID,
                'name' => $p->Name,
                'image' => $p->image,
                'price' => (int)$p->price,
                'originalPrice' => $p->originalPrice ? (int)$p->originalPrice : null,
                'sold' => $p->SoldCount ?? 0,
                'rating' => $ratingData ? (float)$ratingData->rating : 0,
                'ratingCount' => $ratingData ? (int)$ratingData->ratingCount : 0,
                'category' => (string)$p->CategoryID,
                'createdAt' => $p->CreatedAt,
                'badge' => null,
            ];
        });

        return response()->json([
            'shopInfo' => $shopInfo,
            'products' => $products,
            'categories' => $categories,
            'pagination' => [
                'total' => $paginatedProducts->total(),
                'per_page' => $paginatedProducts->perPage(),
                'current_page' => $paginatedProducts->currentPage(),
                'last_page' => $paginatedProducts->lastPage(),
            ],
        ]);
    }

    public function toggleFollow($shopId, Request $request)
    {
        $user = $request->user();

        $follow = DB::table('shopfollows')
            ->where('UserID', $user->UserID)
            ->where('ShopID', $shopId)
            ->first();

        if ($follow) {
            DB::table('shopfollows')->where('FollowID', $follow->FollowID)->delete();
            return response()->json(['message' => 'Unfollowed successfully']);
        } else {
            DB::table('shopfollows')->insert([
                'UserID' => $user->UserID,
                'ShopID' => $shopId,
                'FollowedAt' => now()
            ]);
            return response()->json(['message' => 'Followed successfully']);
        }
    }
}