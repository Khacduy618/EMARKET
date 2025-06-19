<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class VoucherController extends Controller
{
    // /**
    //  * Get available vouchers for the authenticated user.
    //  * This method fetches both platform-wide and shop-specific vouchers,
    //  * and includes user-specific usage counts.
    //  *
    //  * @param Request $request
    //  * @return \Illuminate\Http\JsonResponse
    //  */
    // public function index(Request $request)
    // {
    //     $user = Auth::user();
    //     $now = Carbon::now();

    //     // Get shop IDs from user's current cart items for more targeted shop vouchers
    //     $cartShopIds = DB::table('Carts AS c')
    //         ->join('CartItems AS ci', 'c.CartID', '=', 'ci.CartID')
    //         ->where('c.UserID', $user->UserID)
    //         ->distinct()
    //         ->pluck('ci.ShopID');

    //     try {
    //         // Base query for vouchers, including user-specific usage count
    //         $baseVoucherQuery = DB::table('Vouchers AS v')
    //             ->leftJoin('UserVouchers AS uv', function ($join) use ($user) {
    //                 $join->on('v.VoucherID', '=', 'uv.VoucherID')
    //                      ->where('uv.UserID', '=', $user->UserID);
    //             })
    //             ->where('v.IsActive', 1)
    //             ->where('v.StartDate', '<=', $now)
    //             ->where('v.EndDate', '>=', $now)
    //             ->select(
    //                 'v.VoucherID', 'v.Code', 'v.Description', 'v.VoucherType', 'v.DiscountType', // Thêm VoucherType
    //                 'v.DiscountValue', 'v.MaxValueForPercentage', 'v.MinOrderValue', 'v.StartDate', 'v.EndDate',
    //                 'v.UsageLimitPerUser', 'v.UsageLimitTotal', 'v.TimesUsed',
    //                 'v.Scope', 'v.ShopID', 'v.IsActive', 'v.CreatedBy', 'v.UserID',
    //                 'v.CreatedAt', 'v.UpdatedAt',
    //                 DB::raw('COUNT(uv.UserVoucherID) as TimesUsedByUser') // Đếm số lần user này đã dùng voucher
    //             )
    //             ->groupBy(
    //                 'v.VoucherID', 'v.Code', 'v.Description', 'v.VoucherType', 'v.DiscountType', // Thêm VoucherType vào groupBy
    //                 'v.DiscountValue', 'v.MaxValueForPercentage', 'v.MinOrderValue', 'v.StartDate', 'v.EndDate',
    //                 'v.UsageLimitPerUser', 'v.UsageLimitTotal', 'v.TimesUsed',
    //                 'v.Scope', 'v.ShopID', 'v.IsActive', 'v.CreatedBy', 'v.UserID',
    //                 'v.CreatedAt', 'v.UpdatedAt'
    //             );

    //         // Fetch platform-wide vouchers
    //         $platformVouchers = (clone $baseVoucherQuery)
    //             ->where('v.Scope', 'Platform')
    //             // Thêm điều kiện kiểm tra giới hạn sử dụng
    //             ->havingRaw('v.UsageLimitTotal IS NULL OR v.TimesUsed < v.UsageLimitTotal')
    //             ->havingRaw('v.UsageLimitPerUser IS NULL OR TimesUsedByUser < v.UsageLimitPerUser')
    //             ->get();

    //         // Fetch shop-specific vouchers
    //         $shopVouchers = (clone $baseVoucherQuery)
    //             ->leftJoin('Shops AS s', 'v.ShopID', '=', 's.ShopID') // Join với Shops để lấy ShopName
    //             ->where('v.Scope', 'Shop')
    //             ->whereIn('v.ShopID', $cartShopIds->toArray()) // Lọc theo các shop có trong giỏ hàng
    //             // Thêm điều kiện kiểm tra giới hạn sử dụng
    //             ->havingRaw('v.UsageLimitTotal IS NULL OR v.TimesUsed < v.UsageLimitTotal')
    //             ->havingRaw('v.UsageLimitPerUser IS NULL OR TimesUsedByUser < v.UsageLimitPerUser')
    //             ->selectRaw('s.ShopName') // Select ShopName
    //             ->get();


    //         return response()->json([
    //             'platformVouchers' => $platformVouchers,
    //             'shopVouchers' => $shopVouchers,
    //             'message' => 'Danh sách voucher đã được tải thành công.'
    //         ]);

    //     } catch (\Exception $e) {
    //         Log::error('Error fetching vouchers: ' . $e->getMessage(), ['exception' => $e]);
    //         return response()->json(['message' => 'Không thể tải danh sách voucher. Vui lòng thử lại sau.'], 500);
    //     }
    // }
    /**
     * Get available vouchers for the authenticated user,
     * specifically those they have in UserVouchers table.
     * Includes user-specific usage counts and eligibility checks.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $now = Carbon::now();

        // Get shop IDs from user's current cart items for more targeted shop vouchers
        $cartShopIds = DB::table('Carts AS c')
            ->join('CartItems AS ci', 'c.CartID', '=', 'ci.CartID')
            ->where('c.UserID', $user->UserID)
            ->distinct()
            ->pluck('ci.ShopID');

        try {
            // Base query: JOIN Vouchers with UserVouchers to only get vouchers the user "owns"
            $baseVoucherQuery = DB::table('Vouchers AS v')
                ->join('UserVouchers AS uv_ownership', function ($join) use ($user) {
                    $join->on('v.VoucherID', '=', 'uv_ownership.VoucherID')
                         ->where('uv_ownership.UserID', '=', $user->UserID);
                })
                // LEFT JOIN again to count specific user usage for this voucher
                ->leftJoin(DB::raw('(SELECT VoucherID, UserID, COUNT(*) as UserSpecificUsedCount FROM UserVouchers WHERE UserID = ' . $user->UserID . ' GROUP BY VoucherID, UserID) as uv_usage_count'),
                    'v.VoucherID', '=', 'uv_usage_count.VoucherID' // Changed alias and condition
                )
                ->where('v.IsActive', 1) // Only active vouchers
                ->where('v.StartDate', '<=', $now) // Not yet expired
                ->where('v.EndDate', '>=', $now) // Not yet active
                ->select(
                    'v.VoucherID', 'v.Code', 'v.Description', 'v.VoucherType', 'v.DiscountType',
                    'v.DiscountValue', 'v.MaxValueForPercentage', 'v.MinOrderValue', 'v.StartDate', 'v.EndDate',
                    'v.UsageLimitPerUser', 'v.UsageLimitTotal', 'v.TimesUsed', // Total TimesUsed from Vouchers table
                    'v.Scope', 'v.ShopID', 'v.IsActive', 'v.CreatedBy', 'v.UserID', // CreatedBy UserID (for seller)
                    'v.CreatedAt', 'v.UpdatedAt',
                    DB::raw('COALESCE(uv_usage_count.UserSpecificUsedCount, 0) as TimesUsedByUser') // Get count, default to 0 if null
                )
                ->groupBy(
                    'v.VoucherID', 'v.Code', 'v.Description', 'v.VoucherType', 'v.DiscountType',
                    'v.DiscountValue', 'v.MaxValueForPercentage', 'v.MinOrderValue', 'v.StartDate', 'v.EndDate',
                    'v.UsageLimitPerUser', 'v.UsageLimitTotal', 'v.TimesUsed',
                    'v.Scope', 'v.ShopID', 'v.IsActive', 'v.CreatedBy', 'v.UserID',
                    'v.CreatedAt', 'v.UpdatedAt',
                    'uv_usage_count.UserSpecificUsedCount' // Group by this too
                );

            // Platform Vouchers (from user's owned vouchers)
            $platformVouchers = (clone $baseVoucherQuery)
                ->where('v.Scope', 'Platform')
                // Các điều kiện HAVING này đảm bảo voucher chỉ trả về nếu còn khả dụng
                // Dòng này đã đúng trong các phiên bản trước
                ->havingRaw('v.UsageLimitTotal IS NULL OR v.TimesUsed < v.UsageLimitTotal') // Kiểm tra tổng lượt dùng
                ->havingRaw('v.UsageLimitPerUser IS NULL OR TimesUsedByUser < v.UsageLimitPerUser') // Kiểm tra lượt dùng của user
                ->get();

            // Shop Vouchers (from user's owned vouchers, filtered by shops in cart)
            $shopVouchers = (clone $baseVoucherQuery)
                ->leftJoin('Shops AS s', 'v.ShopID', '=', 's.ShopID')
                ->where('v.Scope', 'Shop')
                // Chỉ lấy voucher shop của những shop có trong giỏ hàng hiện tại của người dùng
                ->whereIn('v.ShopID', $cartShopIds->toArray())
                // Các điều kiện HAVING này đảm bảo voucher chỉ trả về nếu còn khả dụng
                ->havingRaw('v.UsageLimitTotal IS NULL OR v.TimesUsed < v.UsageLimitTotal') // Kiểm tra tổng lượt dùng
                ->havingRaw('v.UsageLimitPerUser IS NULL OR TimesUsedByUser < v.UsageLimitPerUser') // Kiểm tra lượt dùng của user
                ->selectRaw('s.ShopName') // Select shop name
                ->get();

            return response()->json([
                'platformVouchers' => $platformVouchers,
                'shopVouchers' => $shopVouchers,
                'message' => 'Danh sách voucher đã được tải thành công.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack(); // Assuming there might be a transaction started earlier if this is part of a larger flow.
            Log::error('Error fetching vouchers: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Không thể tải danh sách voucher. Vui lòng thử lại sau.'], 500);
        }
    }
}