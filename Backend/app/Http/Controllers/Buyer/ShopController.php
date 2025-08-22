<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ShopController extends Controller
{
   /**
     * API 1: Lấy thông tin chi tiết của shop và danh mục.
     * Endpoint này rất nhẹ và được gọi đầu tiên.
     */
    public function getShopDetails($shopId)
    {
        $shop = DB::table('shops')->where('ShopID', $shopId)->first();
        if (!$shop) {
            return response()->json(['message' => 'Shop not found'], 404);
        }

        $followersCount = DB::table('shopfollows')->where('ShopID', $shopId)->count();
        $productsCount = DB::table('products')
            ->where('ShopID', $shopId)
            ->where('IsActive', true)
            ->where('AdminApprovalStatus', 'Approved')
            ->count();
            
        $isFollowing = Auth::guard('sanctum')->check()
            ? DB::table('shopfollows')->where('ShopID', $shopId)->where('UserID', Auth::guard('sanctum')->id())->exists()
            : false;

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
            'rating' => (float)($shopRatingStats->rating ?? 0),
            'ratingCount' => (int)($shopRatingStats->ratingCount ?? 0),
            'followers' => $followersCount,
            'productsCount' => $productsCount,
            'isFollowing' => $isFollowing,
            'isVerified' => $shop->Level === 'Mall',
            'joinedAt' => Carbon::parse($shop->updated_at)->locale('vi')->diffForHumans(),
            'chatResponseRate' => 98, 'responseSpeed' => "trong vài giờ", 'onTimeDeliveryRate' => 99,
        ];
        
        $categoryCounts = DB::table('products')
            ->select('CategoryID', DB::raw('COUNT(ProductID) as product_count'))
            ->where('ShopID', $shopId)->where('IsActive', true)->where('AdminApprovalStatus', 'Approved')
            ->groupBy('CategoryID')->get();
            
        $categoryDetails = DB::table('platformcategories')->whereIn('CategoryID', $categoryCounts->pluck('CategoryID'))->get()->keyBy('CategoryID');

        $categories = $categoryCounts->map(function ($item) use ($categoryDetails) {
            $detail = $categoryDetails->get($item->CategoryID);
            return ['key' => (string)$item->CategoryID, 'label' => $detail->Name ?? 'N/A', 'count' => $item->product_count];
        });
        $categories->prepend(['key' => 'all', 'label' => 'Tất cả', 'count' => $productsCount]);

        return response()->json([
            'shopInfo' => $shopInfo,
            'categories' => $categories,
        ]);
    }

   /**
     * API 2: Chỉ lấy danh sách sản phẩm.
     * Endpoint này được gọi sau hoặc khi người dùng thay đổi bộ lọc.
     */
    public function getShopProducts($shopId, Request $request)
    {
        // Tạo một subquery để tính toán giá cho mỗi sản phẩm.
        // Đây là phần phức tạp nhất.
        $priceSubquery = DB::table('productvariants as pv')
            ->select(
                'pv.ProductID',
                // Tính toán giá bán cuối cùng (finalPrice)
                DB::raw('MIN(
                    CASE 
                        WHEN p.Discount > 0 THEN pv.Price * (1 - p.Discount / 100) 
                        ELSE pv.Price 
                    END
                ) as finalPrice'),
                // Xác định giá gốc (originalPrice)
                DB::raw('MIN(
                    CASE
                        WHEN pv.CompareAtPrice > 0 THEN pv.CompareAtPrice
                        WHEN p.Discount > 0 THEN pv.Price
                        ELSE NULL
                    END
                ) as originalPrice')
            )
            ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
            ->groupBy('pv.ProductID');


        $productQuery = DB::table('products as p')
            // Join với subquery đã tính toán giá ở trên
            ->joinSub($priceSubquery, 'prices', function ($join) {
                $join->on('p.ProductID', '=', 'prices.ProductID');
            })
            ->select(
                'p.ProductID', 'p.Name', 'p.SoldCount', 'p.CreatedAt', 'p.CategoryID',
                'prices.finalPrice as price', // Lấy giá đã tính toán
                'prices.originalPrice as originalPrice' // Lấy giá gốc đã tính toán
            )
            ->selectSub(fn($q) => $q->from('productimages')->select('ImageURL')->whereColumn('ProductID', 'p.ProductID')->where('IsPrimary', true)->limit(1), 'image')
            ->selectSub(fn($q) => $q->from('productreviews as pr')->join('productvariants as pv', 'pr.VariantID', '=', 'pv.VariantID')->selectRaw('AVG(pr.Rating)')->whereColumn('pv.ProductID', 'p.ProductID'), 'averageRating')
            ->selectSub(fn($q) => $q->from('productreviews as pr')->join('productvariants as pv', 'pr.VariantID', '=', 'pv.VariantID')->selectRaw('COUNT(pr.ReviewID)')->whereColumn('pv.ProductID', 'p.ProductID'), 'ratingCount')
            ->where('p.ShopID', $shopId)
            ->where('p.IsActive', true)
            ->where('p.AdminApprovalStatus', 'Approved');

        // --- LỌC KHOẢNG GIÁ TRÊN GIÁ CUỐI CÙNG ---
        if ($request->filled('priceMin')) {
            $productQuery->where('prices.finalPrice', '>=', $request->input('priceMin'));
        }
        if ($request->filled('priceMax')) {
            $productQuery->where('prices.finalPrice', '<=', $request->input('priceMax'));
        }

        // Filter khác
        if ($request->filled('q')) $productQuery->where('p.Name', 'like', '%' . $request->input('q') . '%');
        if ($request->filled('category') && $request->input('category') !== 'all') $productQuery->where('p.CategoryID', $request->input('category'));
        
        // Sắp xếp
        $sortBy = $request->input('sortBy', 'popular');
        switch ($sortBy) {
            case 'newest': $productQuery->orderBy('p.CreatedAt', 'desc'); break;
            case 'price-asc': $productQuery->orderBy('price', 'asc'); break;
            case 'price-desc': $productQuery->orderBy('price', 'desc'); break;
            case 'popular': default: $productQuery->orderBy('p.SoldCount', 'desc'); break;
        }

        $paginatedProducts = $productQuery->paginate(20);

        // Transform collection để tính % giảm giá và ép kiểu
        $paginatedProducts->getCollection()->transform(function ($p) {
            $finalPrice = (int)($p->price ?? 0);
            $originalPrice = $p->originalPrice ? (int)$p->originalPrice : null;
            $discountPercent = 0;

            if ($originalPrice && $originalPrice > $finalPrice) {
                $discountPercent = round((($originalPrice - $finalPrice) / $originalPrice) * 100);
            }

            $p->price = $finalPrice;
            $p->originalPrice = $originalPrice;
            $p->discountPercent = $discountPercent;
            $p->averageRating = (float)($p->averageRating ?? 0);
            $p->ratingCount = (int)($p->ratingCount ?? 0);

            return $p;
        });

        return $paginatedProducts;
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