<?php
namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
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
        $initialQueryDate = $request->filled('date')
            ? Carbon::parse($dateInput, $tz)->startOfDay()
            : Carbon::now($tz)->startOfDay();

        $now = Carbon::now($tz);

        $slotsDefinition = [
            ['start' => 7,  'end' => 9],
            ['start' => 9,  'end' => 12],
            ['start' => 12, 'end' => 13],
            ['start' => 16, 'end' => 17],
            ['start' => 22, 'end' => 23],
        ];

        $datesToProcess = [$initialQueryDate->copy()];
        $allSlotsResult = [];

        $baseDbQuery = DB::table('FlashSale as fs')
            ->join('EnrollFlashSale as efs', 'fs.FlashSaleID', '=', 'efs.FlashSaleID')
            ->join('Products as p', 'efs.productID', '=', 'p.productID')
            ->join('Users as u', 'fs.userID', '=', 'u.userID')
            ->leftJoin('ProductImages as pi', function ($join) {
                $join->on('p.ProductID', '=', 'pi.ProductID')
                     ->where('pi.IsPrimary', '=', 1);
            })
            ->leftJoin('ProductVariants as oki', 'p.ProductID', '=', 'oki.ProductID')
            ->whereExists(function ($query) {
                $query->select(DB::raw(1))
                      ->from('ProductVariantAttribute as pva')
                      // Điều kiện join là variant của sản phẩm trong flash sale
                      ->whereColumn('pva.VariantID', 'oki.VariantID');
            })
            
            ->select(
                'fs.FlashSaleID', 'fs.UserID', 'u.UserName', 'p.ProductID',
                'p.Name as ProductName',
                'efs.Discount', 'efs.Quantity',
                DB::raw('MIN(oki.Price) as Price'),
                'fs.StartTime', 'fs.EndTime',
                'pi.ImageURL as ProductImage'
            )
            ->groupBy(
                'fs.FlashSaleID', 'fs.UserID', 'u.UserName', 'p.ProductID',
                'p.Name', 'efs.Discount', 'efs.Quantity',
                'fs.StartTime', 'fs.EndTime', 'pi.ImageURL'
            )
            ->orderBy('fs.StartTime', 'ASC');

        foreach ($datesToProcess as $currentProcessingDate) {
            $dailySlotsResult = [];

            foreach ($slotsDefinition as $slotDef) {
                $slotStartCarbon = $currentProcessingDate->copy()->hour($slotDef['start'])->minute(0)->second(0);
                $slotEndCarbon = $currentProcessingDate->copy()->hour($slotDef['end'])->minute(0)->second(0);

                if ($slotDef['end'] <= $slotDef['start']) {
                    $slotEndCarbon->addDay();
                }

                $status = 'Đã kết thúc';
                if ($now->lt($slotStartCarbon)) {
                    $status = 'Sắp diễn ra';
                } elseif ($now->gte($slotStartCarbon) && $now->lt($slotEndCarbon)) {
                    $status = 'Đang diễn ra';
                }

                $flashSales = $baseDbQuery->clone()
                    ->where(function ($query) use ($slotStartCarbon, $slotEndCarbon) {
                        $query->where('fs.StartTime', '>=', $slotStartCarbon)
                              ->where('fs.StartTime', '<', $slotEndCarbon);
                    })
                    ->get();
                
                // Ẩn giá nếu slot ở trạng thái "Sắp diễn ra"
                if ($status === 'Sắp diễn ra') {
                    $flashSales->map(function ($sale) {
                        $sale->Price = null;
                        $sale->Discount = null;
                        return $sale;
                    });
                }
                
                // *** SỬA LỖI Ở ĐÂY: Chỉ thêm vào mảng MỘT LẦN DUY NHẤT ***
                $dailySlotsResult[] = [
                    'slot_display_time' => sprintf('%02d:00', $slotDef['start']),
                    'slot_effective_start' => $slotStartCarbon->toDateTimeString(),
                    'slot_effective_end' => $slotEndCarbon->toDateTimeString(),
                    'status' => $status,
                    'flash_sales' => $flashSales,
                ];
            }
            
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