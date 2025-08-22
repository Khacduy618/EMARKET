<?php
namespace App\Traits;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

trait ManagesVoucherUsage {
    public function updateUserVoucherUsage($order) {
        $platformCodes = json_decode($order->PlatformVoucherCode, true) ?: [];
        $shopVouchers = json_decode($order->shopvoucher, true) ?: [];
        $shopCodes = array_column($shopVouchers, 'code');

        $allAppliedCodes = array_filter(array_merge([$platformCodes['saleOff'] ?? null], [$platformCodes['freeShip'] ?? null], $shopCodes));
        
        if (empty($allAppliedCodes)) return;

        $vouchersToUpdate = DB::table('vouchers')->whereIn('Code', $allAppliedCodes)->get();

        if ($vouchersToUpdate->isEmpty()) return;
        foreach ($vouchersToUpdate as $voucher) {
        // Tăng tổng số lần sử dụng trên bảng `vouchers`
        DB::table('vouchers')->where('VoucherID', $voucher->VoucherID)->increment('TimesUsed');
        
        // **LOGIC MỚI: Tăng bộ đếm trong bảng uservouchers**
        // Thay vì INSERT, chúng ta UPDATE (increment)
        DB::table('uservouchers')
            ->where('UserID', $order->UserID)
            ->where('VoucherID', $voucher->VoucherID)
            ->increment('TimesUsedByUser'); // Cộng 1 vào cột TimesUsedByUser
    }

    Log::info("Successfully updated usage counters for vouchers in OrderID: {$order->OrderID}", $allAppliedCodes);
    }
}