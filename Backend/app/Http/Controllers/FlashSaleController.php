<?php
// namespace App\Http\Controllers;

// use Illuminate\Support\Facades\DB;
// use Illuminate\Http\Request;
// use Carbon\Carbon;
// use Carbon\CarbonTimeZone;

// class FlashSaleController extends Controller
// {
//     public function getFlashSalesGroupedBySlot(Request $request)
//     {
//         $tz = new CarbonTimeZone('Asia/Ho_Chi_Minh');

//         $dateInput = $request->input('date');
//         $initialQueryDate = $request->filled('date')
//             ? Carbon::parse($dateInput, $tz)->startOfDay()
//             : Carbon::now($tz)->startOfDay();

//         $now = Carbon::now($tz);

//         $slotsDefinition = [
//             ['start' => 7,  'end' => 9],
//             ['start' => 9,  'end' => 12],
//             ['start' => 12, 'end' => 13],
//             ['start' => 15, 'end' => 16],
//             ['start' => 23, 'end' => 00],
//         ];

//         $datesToProcess = [
//             $initialQueryDate->copy(),
//         ];

//         $allSlotsResult = [];

//         // --- BẮT ĐẦU PHẦN SỬA ĐỔI ---
//         $baseDbQuery = DB::table('FlashSale as fs')
//             ->join('EnrollFlashSale as efs', 'fs.FlashSaleID', '=', 'efs.FlashSaleID')
//             ->join('products as p', 'efs.productID', '=', 'p.productID')
//             ->join('users as u', 'fs.userID', '=', 'u.userID')
//             ->leftJoin('ProductImages as pi', function ($join) {
//                 $join->on('p.ProductID', '=', 'pi.ProductID')
//                      ->where('pi.IsPrimary', '=', 1);
//             })
//             ->leftJoin('ProductVariants as oki', 'p.ProductID', '=', 'oki.ProductID')
//             ->select(
//                 'fs.FlashSaleID', 'fs.UserID', 'u.UserName', 'p.ProductID',
//                 'p.Name as ProductName',
//                 'efs.Discount', 'efs.Quantity',
//                 // Dùng MIN() để lấy giá thấp nhất từ các variant
//                 DB::raw('MIN(oki.Price) as Price'),
//                 'fs.StartTime', 'fs.EndTime',
//                 'pi.ImageURL as ProductImage'
//             )
//             // Thêm GROUP BY để gom các variant của cùng 1 sản phẩm
//             ->groupBy(
//                 'fs.FlashSaleID', 'fs.UserID', 'u.UserName', 'p.ProductID',
//                 'p.Name', 'efs.Discount', 'efs.Quantity',
//                 'fs.StartTime', 'fs.EndTime', 'pi.ImageURL'
//             )
//             ->orderBy('fs.StartTime', 'ASC');
//         // --- KẾT THÚC PHẦN SỬA ĐỔI ---

//         foreach ($datesToProcess as $currentProcessingDate) {
//             $dailySlotsResult = [];

//             foreach ($slotsDefinition as $slotDef) {
//                 $slotStartCarbon = $currentProcessingDate->copy()->hour($slotDef['start'])->minute(0)->second(0);
//                 $slotEndCarbon = $currentProcessingDate->copy()->hour($slotDef['end'])->minute(0)->second(0);

//                 if ($slotDef['end'] <= $slotDef['start']) {
//                     if (!($slotDef['start'] == 0 && $slotDef['end'] == 0) ||
//                         ($slotDef['start'] == 0 && $slotDef['end'] == 0 && $request->input('treat_0_0_as_24h', false))
//                        ) {
//                         $slotEndCarbon->addDay();
//                     }
//                 }

//                 $status = null;
//                 if ($now->lt($slotStartCarbon)) {
//                     $status = 'Sắp diễn ra';
//                 } elseif ($now->gte($slotStartCarbon) && $now->lt($slotEndCarbon)) {
//                     $status = 'Đang diễn ra';
//                 } else {
//                     $status = 'Đã kết thúc'; // Thêm trạng thái này
//                 }

//                 // Bỏ đi điều kiện if ($status !== null)
//                 // if ($status !== null) { // Xóa dòng này đi
//                     $flashSales = $baseDbQuery->clone()
//                         ->where(function ($query) use ($slotStartCarbon, $slotEndCarbon) {
//                             $query->where('fs.StartTime', '<', $slotEndCarbon)
//                                 ->where('fs.EndTime', '>', $slotStartCarbon);
//                         })
//                         ->get();

//                     $dailySlotsResult[] = [
//                         'slot_display_time' => sprintf('%02d:00 - %02d:00', $slotDef['start'], $slotDef['end']),
//                         'slot_effective_start' => $slotStartCarbon->toDateTimeString(),
//                         'slot_effective_end' => $slotEndCarbon->toDateTimeString(),
//                         'status' => $status,
//                         'flash_sales' => $flashSales,
//                     ];
                
//             }
            
//             if (!empty($dailySlotsResult)) {
//                 $allSlotsResult[] = [
//                     'date' => $currentProcessingDate->toDateString(),
//                     'slots_on_date' => $dailySlotsResult,
//                 ];
//             }
//         }

//         return response()->json([
//             'initial_requested_date_or_today' => $initialQueryDate->toDateString(),
//             'current_server_time_hcm' => $now->toDateTimeString(),
//             'daily_flash_sales_slots' => $allSlotsResult,
//         ]);
//     }
// }

// namespace App\Http\Controllers;

// use Illuminate\Support\Facades\DB;
// use Illuminate\Http\Request;
// use Carbon\Carbon;
// use Carbon\CarbonTimeZone;

// class FlashSaleController extends Controller
// {
//     public function getFlashSalesGroupedBySlot(Request $request)
//     {
//         $tz = new CarbonTimeZone('Asia/Ho_Chi_Minh');

//         $dateInput = $request->input('date');
//         // Luôn lấy thời gian bắt đầu của ngày để đảm bảo tính toán khung giờ chính xác
//         $initialQueryDate = $request->filled('date')
//             ? Carbon::parse($dateInput, $tz)->startOfDay()
//             : Carbon::now($tz)->startOfDay();

//         $now = Carbon::now($tz);

//         // Các khung giờ Flash Sale trong ngày
//         $slotsDefinition = [
//             ['start' => 7,  'end' => 9],
//             ['start' => 9,  'end' => 12],
//             ['start' => 12, 'end' => 13],
//             ['start' => 17, 'end' => 18],
//             ['start' => 23, 'end' => 0], // Sửa thành 0 để xử lý qua ngày dễ hơn
//         ];

//         // Hiện tại chỉ xử lý cho 1 ngày được yêu cầu
//         $datesToProcess = [
//             $initialQueryDate->copy(),
//         ];

//         $allSlotsResult = [];

//         // Xây dựng câu truy vấn cơ sở để có thể tái sử dụng
//         $baseDbQuery = DB::table('FlashSale as fs')
//             ->join('EnrollFlashSale as efs', 'fs.FlashSaleID', '=', 'efs.FlashSaleID')
//             ->join('products as p', 'efs.productID', '=', 'p.productID')
//             ->join('users as u', 'fs.userID', '=', 'u.userID')
//             ->leftJoin('ProductImages as pi', function ($join) {
//                 $join->on('p.ProductID', '=', 'pi.ProductID')
//                      ->where('pi.IsPrimary', '=', 1);
//             })
//             // Join với ProductVariants để lấy giá
//             ->leftJoin('ProductVariants as oki', 'p.ProductID', '=', 'oki.ProductID')
//             ->select(
//                 'fs.FlashSaleID', 'fs.UserID', 'u.UserName', 'p.ProductID',
//                 'p.Name as ProductName',
//                 'efs.Discount', 'efs.Quantity',
//                 // Dùng MIN() để lấy giá thấp nhất từ các variant, nếu không có variant thì lấy giá gốc
//                 DB::raw('MIN(oki.Price) as Price'),
//                 'fs.StartTime', 'fs.EndTime',
//                 'pi.ImageURL as ProductImage'
//             )
//             // Gom nhóm các variant của cùng 1 sản phẩm trong cùng 1 đợt flash sale
//             ->groupBy(
//                 'fs.FlashSaleID', 'fs.UserID', 'u.UserName', 'p.ProductID',
//                 'p.Name', 'efs.Discount', 'efs.Quantity',
//                 'fs.StartTime', 'fs.EndTime', 'pi.ImageURL'
//             )
//             ->orderBy('fs.StartTime', 'ASC');

//         foreach ($datesToProcess as $currentProcessingDate) {
//             $dailySlotsResult = [];

//             foreach ($slotsDefinition as $slotDef) {
//                 $slotStartCarbon = $currentProcessingDate->copy()->hour($slotDef['start'])->minute(0)->second(0);
//                 $slotEndCarbon = $currentProcessingDate->copy()->hour($slotDef['end'])->minute(0)->second(0);

//                 // Xử lý trường hợp khung giờ qua ngày (ví dụ: 23:00 - 00:00)
//                 if ($slotDef['end'] <= $slotDef['start']) {
//                     $slotEndCarbon->addDay();
//                 }

//                 $status = 'Đã kết thúc'; // Mặc định là đã kết thúc
//                 if ($now->lt($slotStartCarbon)) {
//                     $status = 'Sắp diễn ra';
//                 } elseif ($now->gte($slotStartCarbon) && $now->lt($slotEndCarbon)) {
//                     $status = 'Đang diễn ra';
//                 }

//                 // Sao chép câu truy vấn cơ sở và thêm điều kiện lọc theo khung giờ
//                 $flashSalesInSlotQuery = $baseDbQuery->clone()
//                     ->where(function ($query) use ($slotStartCarbon, $slotEndCarbon) {
//                         // --- BẮT ĐẦU PHẦN SỬA ĐỔI CHÍNH ---
//                         // Logic cũ (lấy tất cả sản phẩm có thời gian CHỒNG CHÉO với khung giờ):
//                         // $query->where('fs.StartTime', '<', $slotEndCarbon)
//                         //       ->where('fs.EndTime', '>', $slotStartCarbon);

//                         // Logic mới (chỉ lấy sản phẩm có thời gian BẮT ĐẦU nằm trong khung giờ):
//                         $query->where('fs.StartTime', '>=', $slotStartCarbon)
//                               ->where('fs.StartTime', '<', $slotEndCarbon);
//                         // --- KẾT THÚC PHẦN SỬA ĐỔI CHÍNH ---
//                     });

//                 $flashSales = $flashSalesInSlotQuery->get();
//                                 // BẮT ĐẦU PHẦN SỬA ĐỔI
//                 if ($status === 'Sắp diễn ra') {
//                     // Nếu cả khung giờ này "Sắp diễn ra", duyệt qua từng sản phẩm và ẩn giá
//                     $flashSales->map(function ($sale) {
//                         $sale->Price = null;    // Đặt giá về null
//                         $sale->Discount = null; // Đặt chiết khấu về null
//                         return $sale;
//                     });
//                 }
//                 // KẾT THÚC PHẦN SỬA ĐỔI

//                 $dailySlotsResult[] = [
//                     'slot_display_time' => sprintf('%02d:00', $slotDef['start']),
//                     'slot_effective_start' => $slotStartCarbon->toDateTimeString(),
//                     'slot_effective_end' => $slotEndCarbon->toDateTimeString(),
//                     'status' => $status,
//                     'flash_sales' => $flashSales, // Gửi đi danh sách đã được xử lý
//                 ];

//                 $dailySlotsResult[] = [
//                     'slot_display_time' => sprintf('%02d:00', $slotDef['start']), // Hiển thị giờ bắt đầu là đủ
//                     'slot_effective_start' => $slotStartCarbon->toDateTimeString(),
//                     'slot_effective_end' => $slotEndCarbon->toDateTimeString(),
//                     'status' => $status,
//                     'flash_sales' => $flashSales,
//                 ];
//             }
            
//             if (!empty($dailySlotsResult)) {
//                 $allSlotsResult[] = [
//                     'date' => $currentProcessingDate->toDateString(),
//                     'slots_on_date' => $dailySlotsResult,
//                 ];
//             }
//         }

//         return response()->json([
//             'initial_requested_date_or_today' => $initialQueryDate->toDateString(),
//             'current_server_time_hcm' => $now->toDateTimeString(),
//             'daily_flash_sales_slots' => $allSlotsResult,
//         ]);
//     }
// }

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
        $initialQueryDate = $request->filled('date')
            ? Carbon::parse($dateInput, $tz)->startOfDay()
            : Carbon::now($tz)->startOfDay();

        $now = Carbon::now($tz);

        $slotsDefinition = [
            ['start' => 7,  'end' => 9],
            ['start' => 9,  'end' => 12],
            ['start' => 12, 'end' => 13],
            ['start' => 16, 'end' => 17],
            ['start' => 20, 'end' => 21],
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