<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrderBuyer;
use App\Models\ReturnRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getPlatformStats(Request $request)
    {
        // (Bạn có thể thêm middleware hoặc kiểm tra quyền Admin ở đây)

        $validated = $request->validate([
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date'   => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
        ]);

        $startDate = Carbon::parse($validated['start_date'] ?? now()->subDays(6))->startOfDay();
        $endDate   = Carbon::parse($validated['end_date'] ?? now())->endOfDay();
        
        // === 1. TỔNG DOANH THU (Gross Merchandise Volume - GMV) ===
        // Là tổng giá trị tất cả các đơn hàng đã thanh toán thành công (chưa trừ hoàn tiền)
        $grossRevenueQuery = OrderBuyer::where('PaymentStatus', 'Paid')
                                       ->whereBetween('paidAt', [$startDate, $endDate]);

        $totalGrossRevenue = $grossRevenueQuery->sum('TotalAmount');

        // === 2. TỔNG TIỀN ĐÃ HOÀN (Total Refunded) ===
        // Là tổng tất cả các yêu cầu đã được xử lý hoàn tiền thành công
        $refundedQuery = ReturnRequest::where('Status', 'Refunded')
                                      ->whereBetween('ResolvedAt', [$startDate, $endDate]);

        $totalRefundedAmount = $refundedQuery->sum('RefundAmount');
        $totalRefundedOrders = $refundedQuery->count();

        // === 3. DOANH THU RÒNG (Net Revenue) ===
        // Doanh thu thực tế sau khi đã trừ đi tiền hoàn trả
        $netRevenue = $totalGrossRevenue - $totalRefundedAmount;
        
        // === 4. DỮ LIỆU BIỂU ĐỒ ===
        // Biểu đồ Doanh thu và Hoàn tiền theo ngày
        $dailyGrossRevenue = (clone $grossRevenueQuery)
            ->select(DB::raw('DATE(paidAt) as date'), DB::raw('SUM(TotalAmount) as total'))
            ->groupBy('date')->orderBy('date')->pluck('total', 'date');

        $dailyRefunds = (clone $refundedQuery)
            ->select(DB::raw('DATE(ResolvedAt) as date'), DB::raw('SUM(RefundAmount) as total'))
            ->groupBy('date')->orderBy('date')->pluck('total', 'date');

        // Tạo một chuỗi ngày đầy đủ để biểu đồ không bị đứt gãy
        $period = Carbon::parse($startDate)->toPeriod($endDate);
        $chartLabels = [];
        $chartGrossData = [];
        $chartRefundData = [];

        foreach ($period as $date) {
            $dateKey = $date->format('Y-m-d');
            $chartLabels[] = $date->format('d/m');
            $chartGrossData[] = $dailyGrossRevenue[$dateKey] ?? 0;
            $chartRefundData[] = $dailyRefunds[$dateKey] ?? 0;
        }

        // Trả về dữ liệu cho frontend
        return response()->json([
            'kpis' => [
                'grossRevenue' => (float) $totalGrossRevenue,
                'totalRefunded' => (float) $totalRefundedAmount,
                'netRevenue' => (float) $netRevenue,
                'totalRefundedOrders' => (int) $totalRefundedOrders,
            ],
            'revenueChart' => [
                'labels' => $chartLabels,
                'datasets' => [
                    [
                        'label' => 'Doanh thu',
                        'data' => $chartGrossData,
                        'borderColor' => '#3b82f6', // Màu xanh
                        'backgroundColor' => 'rgba(59, 130, 246, 0.2)',
                        'fill' => true,
                    ],
                    [
                        'label' => 'Hoàn tiền',
                        'data' => $chartRefundData,
                        'borderColor' => '#ef4444', // Màu đỏ
                        'backgroundColor' => 'rgba(239, 68, 68, 0.2)',
                        'fill' => true,
                    ]
                ]
            ],
            'filters' => [
                'startDate' => $startDate->toDateString(),
                'endDate'   => $endDate->toDateString(),
            ]
        ]);
    }
}