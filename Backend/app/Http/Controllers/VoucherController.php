<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Models\Voucher;

class VoucherController extends Controller
{

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

    /**
     * Get all collected vouchers for a specific shop for the authenticated user.
     * This method provides the raw data for the frontend to determine eligibility dynamically.
     *
     * @param Request $request
     * @param int $shopId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getEligibleVouchersForShop(Request $request, $shopId)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $now = Carbon::now();

        try {
            // Lấy tất cả voucher của shop mà người dùng này đã lưu
            // Giả định bảng UserVouchers lưu các voucher mà user đã "sưu tầm"
            $vouchers = Voucher::where('Scope', 'Shop')
                ->where('ShopID', $shopId)
                // Chỉ lấy những voucher còn hoạt động và trong thời hạn
                ->where('IsActive', 1)
                ->where('StartDate', '<=', $now)
                ->where('EndDate', '>=', $now)
                // Chỉ lấy những voucher mà user này có trong bảng UserVouchers
                ->whereHas('userVouchers', function ($query) use ($user) {
                    $query->where('UserID', $user->UserID);
                })
                // Lấy thông tin về lượt sử dụng của người dùng này cho mỗi voucher
                // ->withCount(['userVouchers as times_used_by_user' => function ($query) use ($user) {
                //     $query->where('UserID', $user->UserID);
                // }])
                ->orderBy('CreatedAt', 'desc') 
                ->get();

            // Frontend sẽ tự xử lý việc so sánh với MinOrderValue
            return response()->json([
                'vouchers' => $vouchers,
                'message' => 'Shop vouchers for user fetched successfully.'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching shop vouchers for user: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Không thể tải danh sách voucher. Vui lòng thử lại sau.'], 500);
        }
    }
}