<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Models\Voucher;

class VoucherController extends Controller
{

   /**
     * Lấy TẤT CẢ voucher (Platform & Shop) mà người dùng đã sưu tầm.
     * Dùng cho trang "Kho Voucher".
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

        try {
            // Lấy tất cả voucher người dùng đã sưu tầm
            $userCollectedVouchers = DB::table('uservouchers as uv')
                ->join('vouchers as v', 'uv.VoucherID', '=', 'v.VoucherID')
                // Join thêm với bảng shops để lấy tên shop, dùng LEFT JOIN
                ->leftJoin('shops as s', 'v.ShopID', '=', 's.ShopID')
                ->where('uv.UserID', $user->UserID)
                ->select(
                    'v.*', // Lấy tất cả thông tin từ bảng vouchers
                    'uv.TimesUsedByUser', // Lấy số lần đã dùng
                    's.ShopName' // Lấy tên shop nếu có
                )
                ->orderBy('v.EndDate', 'asc') // Ưu tiên hiển thị voucher sắp hết hạn
                ->get();
            
            // Tách ra làm 2 mảng để tiện cho frontend xử lý nếu cần
            $platformVouchers = $userCollectedVouchers->where('Scope', 'Platform')->values();
            $shopVouchers = $userCollectedVouchers->where('Scope', 'Shop')->values();

            return response()->json([
                'platformVouchers' => $platformVouchers,
                'shopVouchers' => $shopVouchers,
                'message' => 'Tải tất cả voucher đã lưu thành công.'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching ALL user collected vouchers for UserID ' . $user->UserID . ': ' . $e->getMessage());
            return response()->json(['message' => 'Không thể tải danh sách voucher.'], 500);
        }
    }

    /**
     * Lấy các voucher PLATFORM đủ điều kiện cho người dùng.
     * Dùng cho modal chọn voucher toàn sàn ở trang thanh toán.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getEligiblePlatformVouchers(Request $request)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $now = Carbon::now();

        try {
            $platformVouchers = DB::table('uservouchers as uv')
                ->join('vouchers as v', 'uv.VoucherID', '=', 'v.VoucherID')
                ->where('uv.UserID', $user->UserID)
                ->where('v.Scope', 'Platform') // Chỉ lấy voucher Platform
                // --- BỘ LỌC TÍNH HỢP LỆ ---
                ->where('v.IsActive', 1)
                ->where('v.StartDate', '<=', $now)
                ->where('v.EndDate', '>=', $now)
                ->where(fn($q) => $q->whereNull('v.UsageLimitTotal')->orWhereRaw('v.TimesUsed < v.UsageLimitTotal'))
                ->where(fn($q) => $q->whereNull('v.UsageLimitPerUser')->orWhereRaw('uv.TimesUsedByUser < v.UsageLimitPerUser'))
                // --- KẾT THÚC BỘ LỌC ---
                ->select('v.*', 'uv.TimesUsedByUser')
                ->orderBy('v.VoucherType', 'asc') // Ưu tiên FreeShip
                ->orderBy('v.MinOrderValue', 'asc')
                ->get();

            return response()->json([
                'platformVouchers' => $platformVouchers,
                'message' => 'Tải các voucher platform hợp lệ thành công.'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching eligible PLATFORM vouchers for UserID ' . $user->UserID . ': ' . $e->getMessage());
            return response()->json(['message' => 'Không thể tải danh sách voucher.'], 500);
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