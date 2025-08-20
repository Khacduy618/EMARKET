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
    if (!$user) {
        return response()->json(['message' => 'Unauthorized'], 401);
    }
    $now = Carbon::now();

    try {
        $cartShopIds = DB::table('Carts AS c')
            ->join('CartItems AS ci', 'c.CartID', '=', 'ci.CartID')
            ->where('c.UserID', $user->UserID)
            ->distinct()
            ->pluck('ci.ShopID');

        // BƯỚC 1: Truy vấn cơ bản, bắt đầu từ những voucher người dùng ĐÃ SƯU TẦM
        $baseQuery = DB::table('uservouchers as uv')
            ->join('vouchers as v', 'uv.VoucherID', '=', 'v.VoucherID')
            ->where('uv.UserID', $user->UserID)
            // Lọc các voucher còn hiệu lực
            ->where('v.IsActive', 1)
            ->where('v.StartDate', '<=', $now)
            ->where('v.EndDate', '>=', $now)
            // Lọc theo giới hạn sử dụng TỔNG
            ->where(function ($query) {
                $query->whereNull('v.UsageLimitTotal')->orWhereRaw('v.TimesUsed < v.UsageLimitTotal');
            })
            // **LOGIC CỐT LÕI:** Lọc theo giới hạn sử dụng CỦA USER
            // So sánh trực tiếp cột TimesUsedByUser từ bảng uservouchers
            ->where(function ($query) {
                $query->whereNull('v.UsageLimitPerUser')->orWhereRaw('uv.TimesUsedByUser < v.UsageLimitPerUser');
            })
            ->select(
                'v.*', // Lấy tất cả thông tin từ bảng vouchers
                'uv.TimesUsedByUser' // Lấy số lần đã dùng từ bảng uservouchers
            );

        // Lấy platform vouchers từ "ví"
        $platformVouchers = (clone $baseQuery)
            ->where('v.Scope', 'Platform')
            ->get();

        // Lấy shop vouchers từ "ví"
        $shopVouchers = [];
        if ($cartShopIds->isNotEmpty()) {
            $shopVouchers = (clone $baseQuery)
                ->join('shops as s', 'v.ShopID', '=', 's.ShopID')
                ->where('v.Scope', 'Shop')
                ->whereIn('v.ShopID', $cartShopIds)
                ->addSelect('s.ShopName')
                ->get();
        }

        return response()->json([
            'platformVouchers' => $platformVouchers,
            'shopVouchers' => $shopVouchers,
            'message' => 'Danh sách voucher của bạn đã được tải thành công.'
        ]);

    } catch (\Exception $e) {
        Log::error('Error fetching user collected vouchers for UserID ' . $user->UserID . ': ' . $e->getMessage());
        return response()->json(['message' => 'Không thể tải danh sách voucher. Vui lòng thử lại sau.'], 500);
    }
}

/**
     * Cho phép người dùng "sưu tầm" hoặc "lưu" một voucher vào ví của họ.
     *
     * @param Request $request
     * @param Voucher $voucher
     * @return \Illuminate\Http\JsonResponse
     */
    public function collectVoucher(Request $request, Voucher $voucher)
    {
        $user = Auth::user();

        // Kiểm tra các điều kiện cơ bản của voucher
        if (!$voucher->IsActive || Carbon::now()->gt($voucher->EndDate)) {
            return response()->json(['message' => 'Voucher không hợp lệ hoặc đã hết hạn.'], 400);
        }

        // Kiểm tra xem người dùng đã sưu tầm voucher này chưa
        $existing = DB::table('uservouchers')
            ->where('UserID', $user->UserID)
            ->where('VoucherID', $voucher->VoucherID)
            ->exists();

        if ($existing) {
            return response()->json(['message' => 'Bạn đã lưu voucher này rồi.'], 409); // 409 Conflict
        }

        // Thêm voucher vào "ví" của người dùng
        DB::table('uservouchers')->insert([
            'UserID' => $user->UserID,
            'VoucherID' => $voucher->VoucherID,
            'TimesUsedByUser' => 0, // Bắt đầu với 0 lần sử dụng
        ]);

        return response()->json(['message' => 'Đã lưu voucher thành công!'], 201);
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