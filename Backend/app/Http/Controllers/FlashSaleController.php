<?php
namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Carbon\CarbonTimeZone;

class FlashSaleController extends Controller
{
    public function getFlashSalesGroupedBySlot(Request $request)
    {
        $tz = new CarbonTimeZone('Asia/Ho_Chi_Minh');

        $dateInput = $request->input('date');
        // $initialQueryDate là ngày cơ sở để bắt đầu, ví dụ: ngày request hoặc ngày hiện tại
        $initialQueryDate = $request->filled('date')
            ? Carbon::parse($dateInput, $tz)->startOfDay()
            : Carbon::now($tz)->startOfDay();

        $now = Carbon::now($tz);

        // Định nghĩa các khung giờ trong một ngày.
        $slotsDefinition = [
            ['start' => 7,  'end' => 9],
            ['start' => 11,  'end' => 12],
            ['start' => 16, 'end' => 17],
            ['start' => 19, 'end' => 20],
        ];

        // Danh sách các ngày chúng ta muốn xử lý (ví dụ: ngày hiện tại và ngày mai)
        // Bạn có thể mở rộng danh sách này nếu muốn nhiều ngày hơn
        $datesToProcess = [
            $initialQueryDate->copy(),
            // $initialQueryDate->copy()->addDay(), // Ngày tiếp theo
        ];
        // Nếu bạn chỉ muốn ngày được request và ngày tiếp theo, thì không cần addDay nếu dateInput đã có.
        // Hoặc, bạn có thể linh hoạt hơn, ví dụ: lấy N ngày kể từ initialQueryDate.
        // Ví dụ đơn giản: chỉ xử lý ngày được request (hoặc ngày hiện tại) và ngày kế tiếp của nó.

        $allSlotsResult = []; // Sẽ chứa kết quả cho tất cả các ngày

        $baseDbQuery = DB::table('FlashSale as fs')
            ->join('EnrollFlashSale as efs', 'fs.FlashSaleID', '=', 'efs.FlashSaleID')
            ->join('products as p', 'efs.productID', '=', 'p.productID')
            ->join('users as u', 'fs.userID', '=', 'u.userID')
            ->leftJoin('ProductImages as pi', function ($join) {
                $join->on('p.ProductID', '=', 'pi.ProductID')
                     ->where('pi.IsPrimary', '=', 1);
                
            })
            ->leftJoin('ProductVariants as oki', function ($join) {
                $join->on('p.ProductID', '=', 'oki.ProductID');
                
            })
            ->select(
                'fs.FlashSaleID', 'fs.UserID', 'u.UserName', 'p.ProductID',
                'p.Name as ProductName',
                'efs.Discount', 'efs.Quantity','oki.Price', 'fs.StartTime', 'fs.EndTime',
                'pi.ImageURL as ProductImage'
            )
            ->orderBy('fs.StartTime', 'ASC');

        foreach ($datesToProcess as $currentProcessingDate) {
            $dailySlotsResult = []; // Kết quả cho ngày đang xử lý hiện tại

            foreach ($slotsDefinition as $slotDef) {
                $slotStartCarbon = $currentProcessingDate->copy()->hour($slotDef['start'])->minute(0)->second(0);
                $slotEndCarbon = $currentProcessingDate->copy()->hour($slotDef['end'])->minute(0)->second(0);

                if ($slotDef['end'] <= $slotDef['start']) {
                    if (!($slotDef['start'] == 0 && $slotDef['end'] == 0) ||
                        ($slotDef['start'] == 0 && $slotDef['end'] == 0 && $request->input('treat_0_0_as_24h', false))
                       ) {
                        $slotEndCarbon->addDay();
                    }
                }

                $status = null;
                if ($now->lt($slotStartCarbon)) {
                    $status = 'Sắp diễn ra';
                } elseif ($now->gte($slotStartCarbon) && $now->lt($slotEndCarbon)) {
                    $status = 'Đang diễn ra';
                }

                if ($status !== null) {
                    $flashSales = $baseDbQuery->clone()
                        ->where(function ($query) use ($slotStartCarbon, $slotEndCarbon) {
                            $query->where('fs.StartTime', '<', $slotEndCarbon)
                                  ->where('fs.EndTime', '>', $slotStartCarbon);
                        })
                        ->get();

                    $dailySlotsResult[] = [
                        'slot_display_time' => sprintf('%02d:00 - %02d:00', $slotDef['start'], $slotDef['end']),
                        'slot_effective_start' => $slotStartCarbon->toDateTimeString(),
                        'slot_effective_end' => $slotEndCarbon->toDateTimeString(),
                        'status' => $status,
                        'flash_sales' => $flashSales,
                    ];
                }
            }

            // Chỉ thêm vào kết quả tổng nếu ngày đó có slot hợp lệ
            if (!empty($dailySlotsResult)) {
                $allSlotsResult[] = [
                    'date' => $currentProcessingDate->toDateString(),
                    'slots_on_date' => $dailySlotsResult,
                ];
            }
        }

        return response()->json([
            'initial_requested_date_or_today' => $initialQueryDate->toDateString(),
            'current_server_time_hcm' => $now->toDateTimeString(),
            'daily_flash_sales_slots' => $allSlotsResult,
        ]);
    }
}