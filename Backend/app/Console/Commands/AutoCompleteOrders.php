<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\OrderSeller;
use Carbon\Carbon;

class AutoCompleteOrders extends Command
{
    protected $signature = 'orders:auto-complete';
    protected $description = 'Tự động chuyển đơn delivered sang completed sau 3 ngày';

    public function handle()
    {
        $orders = OrderSeller::where('Status', 'Delivered')
            ->where('DeliveredAt', '<=', Carbon::now()->subDays(4))
            ->get();

        foreach ($orders as $order) {
            $order->status = 'Completed';
            $order->save();
        }

        $this->info('Đã cập nhật '. $orders->count() .' đơn hàng thành completed.');
    }
}