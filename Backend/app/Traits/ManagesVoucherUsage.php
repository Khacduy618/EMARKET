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
        $userVouchersToInsert = [];
        foreach ($vouchersToUpdate as $voucher) {
            DB::table('vouchers')->where('VoucherID', $voucher->VoucherID)->increment('TimesUsed');
            $userVouchersToInsert[] = [
                'UserID' => $order->UserID, 'VoucherID' => $voucher->VoucherID,
                'ShopID' => $voucher->ShopID, 'OrderID' => $order->OrderID,
                'UsedAt' => now()
            ];
        }
        if (!empty($userVouchersToInsert)) DB::table('uservouchers')->insert($userVouchersToInsert);
        Log::info("Successfully updated usage count for vouchers in OrderID: {$order->OrderID}", $allAppliedCodes);
    }
}