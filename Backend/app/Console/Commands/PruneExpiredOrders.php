<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PruneExpiredOrders extends Command
{
    protected $signature = 'orders:prune-expired';
    protected $description = 'Find and delete expired draft orders that were not completed';

    public function handle()
    {
        $this->info('Starting to prune expired draft orders...');
        Log::info('Scheduled Task: Pruning expired orders started.');

        // Tìm các OrderID của các đơn hàng nháp đã hết hạn
        $expiredOrderIds = DB::table('ordersbuyer as ob')
            // Điều kiện: Đơn hàng phải có thời gian hết hạn và thời gian đó đã qua
            ->whereNotNull('ob.expires_at')
            ->where('ob.expires_at', '<=', Carbon::now())
            // Điều kiện quan trọng: Đơn hàng này phải là đơn nháp (chưa được thanh toán)
            // Ta kiểm tra bằng cách xem có seller order nào đã được thanh toán chưa
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                      ->from('ordersseller as os')
                      ->whereColumn('os.OrderID', 'ob.OrderID')
                      ->where('os.PaymentStatus', '!=', 'Pending');
            })
            ->pluck('ob.OrderID');

        if ($expiredOrderIds->isEmpty()) {
            $this->info('No expired orders found.');
            Log::info('Scheduled Task: No expired orders found to prune.');
            return 0;
        }

        $this->info('Found ' . $expiredOrderIds->count() . ' expired orders to delete.');
        Log::info('Scheduled Task: Found expired orders.', ['order_ids' => $expiredOrderIds->toArray()]);
        
        // Logic hủy đơn hàng (giống trong hàm cancelDraft của bạn)
        DB::transaction(function () use ($expiredOrderIds) {
            // Lấy tất cả items của các đơn hàng sắp bị xóa để hoàn kho
            $itemsToRestore = DB::table('orderitems as oi')
                ->join('ordersseller as os', 'oi.SellerOrderID', '=', 'os.SellerOrderID')
                ->whereIn('os.OrderID', $expiredOrderIds)
                ->select('oi.VariantID', 'oi.Quantity')
                ->get();
            
            // Hoàn kho cho từng sản phẩm
            foreach ($itemsToRestore as $item) {
                DB::table('productvariants')
                    ->where('VariantID', $item->VariantID)
                    ->increment('StockQuantity', $item->Quantity);
            }
            
            // Xóa các đơn hàng buyer, các bảng con (ordersseller, orderitems) sẽ được xóa theo
            // nhờ cascade on delete trong database. Nếu bạn không có cascade, bạn phải xóa tay.
            // Giả sử bạn đã có `->onDelete('cascade')` trong migration.
            DB::table('ordersbuyer')->whereIn('OrderID', $expiredOrderIds)->delete();
        });

        $this->info('Successfully pruned ' . $expiredOrderIds->count() . ' expired orders.');
        Log::info('Scheduled Task: Pruning completed successfully.');
        return 0;
    }
}
