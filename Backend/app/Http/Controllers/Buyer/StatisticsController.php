<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class StatisticsController extends Controller
{
    /**
     * Helper function to build a base query for orders within a date range.
     * This version fixes the logic to correctly include both Paid (online) and Completed (COD) orders.
     */
    private function getBaseOrderQuery(Request $request)
    {
        $user = Auth::user();
        
        // **BẮT ĐẦU LOGGING**
        Log::channel('daily')->info('--- [getBaseOrderQuery] Starting ---');
        
        // 1. Kiểm tra User
        if (!$user) {
            Log::channel('daily')->error('[getBaseOrderQuery] CRITICAL: Auth::user() is null. Request is unauthenticated.');
            // Trả về một query rỗng để không gây lỗi
            return DB::table('ordersbuyer')->whereRaw('1 = 0'); 
        }
        Log::channel('daily')->info("[getBaseOrderQuery] Authenticated UserID: " . $user->UserID);

        $query = DB::table('ordersbuyer as ob')
            ->join('ordersseller as os', 'ob.OrderID', '=', 'os.OrderID')
            ->where('ob.UserID', $user->UserID)
            ->whereIn('os.Status', ['Delivered', 'Completed', 'Rated']);

        // 2. Kiểm tra Date Range
        [$startDate, $endDate] = $this->parseDateRange($request);
        Log::channel('daily')->info("[getBaseOrderQuery] Date Range Parsed - Start: " . ($startDate ? $startDate->toDateTimeString() : 'NULL') . ", End: " . ($endDate ? $endDate->toDateTimeString() : 'NULL'));

        if ($startDate && $endDate) {
            $query->whereBetween('ob.OrderDate', [$startDate, $endDate]);
        }
        
        // 3. Log lại câu query cuối cùng trước khi trả về
        Log::channel('daily')->info('[getBaseOrderQuery] Final SQL Query:', [
            'sql' => $query->toSql(),
            'bindings' => $query->getBindings()
        ]);
        Log::channel('daily')->info('--- [getBaseOrderQuery] Finished ---');
        
        return $query;
    }

    /**
     * Endpoint: Lấy dữ liệu Overview (Tổng chi tiêu, Tổng đơn hàng).
     */
    public function getSpendingOverview(Request $request)
    {
        $baseQuery = $this->getBaseOrderQuery($request);
        
        $overviewData = $baseQuery->select(
            DB::raw('CAST(SUM(os.TotalAmount) AS UNSIGNED) as totalSpent'), 
            DB::raw('COUNT(DISTINCT ob.OrderID) as orderCount')
        )->first();

        // Xử lý trường hợp không có đơn hàng nào
        $overviewData->totalSpent = $overviewData->totalSpent ?? 0;
        $overviewData->orderCount = $overviewData->orderCount ?? 0;

        return response()->json($overviewData);
         // THÊM CODE DEBUG VÀO ĐÂY
    // $baseQuery = $this->getBaseOrderQuery($request);
    // $overviewQuery = $baseQuery->select(
    //     DB::raw('SUM(os.TotalAmount) as totalSpent'),
    //     DB::raw('COUNT(DISTINCT ob.OrderID) as orderCount')
    // );

    // // Dòng này sẽ in ra câu lệnh SQL và các tham số của nó
    // return response()->json([
    //     'sql' => $overviewQuery->toSql(),
    //     'bindings' => $overviewQuery->getBindings(),
    // ]);
    }

    /**
     * Endpoint: Lấy dữ liệu chi tiêu theo Danh mục.
     */
    public function getSpendingByCategory(Request $request)
    {
        $baseQuery = $this->getBaseOrderQuery($request);

        $categorySpending = $baseQuery
            ->join('orderitems as oi', 'os.SellerOrderID', '=', 'oi.SellerOrderID')
            ->join('productvariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
            ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
            ->join('platformcategories as pc', 'p.CategoryID', '=', 'pc.CategoryID')
            ->groupBy('pc.CategoryID', 'pc.Name')
            ->orderByRaw('SUM(oi.Subtotal) DESC')
            ->limit(10)
            ->select(
                'pc.CategoryID as categoryId',
                'pc.Name as categoryName',
                DB::raw('SUM(oi.Subtotal) as amountSpent'),
                DB::raw('COUNT(DISTINCT ob.OrderID) as orderCountInCategory')
            )
            ->get();
        
        return response()->json($categorySpending);
    }

    /**
     * Endpoint: Lấy dữ liệu chi tiêu theo Shop.
     */
    public function getSpendingByShop(Request $request)
    {
        $baseQuery = $this->getBaseOrderQuery($request);

        $shopSpending = $baseQuery
            ->join('shops as s', 'os.ShopID', '=', 's.ShopID')
            ->groupBy('s.ShopID', 's.ShopName')
            ->orderByRaw('SUM(os.TotalAmount) DESC')
            ->limit(10)
            ->select(
                's.ShopID as shopId',
                's.ShopName as shopName',
                DB::raw('SUM(os.TotalAmount) as amountSpent'),
                DB::raw('COUNT(DISTINCT ob.OrderID) as orderCountInShop')
            )
            ->get();

        return response()->json($shopSpending);
    }

    /**
     * Endpoint: Lấy dữ liệu cho biểu đồ Xu hướng.
     */
    public function getSpendingTrend(Request $request)
    {
        $groupBy = $request->input('groupBy', 'monthly');
        $baseQuery = $this->getBaseOrderQuery($request);
        
        $dateFormat = match ($groupBy) {
            'daily'   => '%Y-%m-%d',
            'monthly' => '%Y-%m',
            'yearly'  => '%Y',
            default   => '%Y-%m',
        };
        
        $trendData = $baseQuery
            ->groupBy('datePeriod')
            ->orderBy('datePeriod', 'asc')
            ->select(
                DB::raw("DATE_FORMAT(ob.OrderDate, '{$dateFormat}') as datePeriod"),
                DB::raw('SUM(os.TotalAmount) as amountSpent')
            )
            ->get();

        return response()->json($trendData);
    }
    
    /**
     * Endpoint: Lấy danh sách đơn hàng tóm tắt cho Modal.
     */
    public function getOrdersSummary(Request $request)
    {
        $filterType = $request->input('filterType');
        $filterId = $request->input('filterId');
        
        $baseQuery = $this->getBaseOrderQuery($request);
        
        $orderIdsQuery = (clone $baseQuery)->select('ob.OrderID');

        if ($filterType === 'category' && $filterId) {
            $orderIdsQuery
                ->join('orderitems as oi', 'os.SellerOrderID', '=', 'oi.SellerOrderID')
                ->join('productvariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
                ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
                ->where('p.CategoryID', $filterId);
        } elseif ($filterType === 'shop' && $filterId) {
            $orderIdsQuery->where('os.ShopID', $filterId);
        }
        
        $orderIds = $orderIdsQuery->distinct()->pluck('ob.OrderID');
        
        if ($orderIds->isEmpty()) {
            return response()->json([]);
        }
        
        $orders = DB::table('ordersbuyer')
            ->whereIn('OrderID', $orderIds)
            ->orderBy('OrderDate', 'desc')
            ->select('OrderID', 'OrderCode as orderCode', 'TotalAmount as totalAmount', 'OrderDate as orderDate')
            ->get();
        
        $orderItems = DB::table('orderitems as oi')
            ->join('ordersseller as os', 'oi.SellerOrderID', '=', 'os.SellerOrderID')
            ->join('productvariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
            ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
            ->whereIn('os.OrderID', $orderIds)
            ->select('os.OrderID', 'p.Name as productName')
            ->get()->groupBy('OrderID');

        foreach($orders as $order) {
            $itemsForOrder = $orderItems->get($order->OrderID, collect());
            // Lấy tên các sản phẩm, loại bỏ trùng lặp và chuyển về mảng bình thường
            $order->productNames = $itemsForOrder->pluck('productName')->unique()->values()->all();
        }

        return response()->json($orders);
    }
    
    /**
     * Helper to parse date range from request.
     */
    private function parseDateRange(Request $request)
    {
        $period = $request->input('period', 'this_month');
        $startDate = $request->input('startDate');
        $endDate = $request->input('endDate');

        if ($period === 'custom' && $startDate && $endDate) {
            return [Carbon::parse($startDate)->startOfDay(), Carbon::parse($endDate)->endOfDay()];
        }
        
        $now = Carbon::now();
        switch ($period) {
            case 'this_month':
                return [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()];
            case 'last_month':
                return [$now->copy()->subMonth()->startOfMonth(), $now->copy()->subMonth()->endOfMonth()];
            case 'this_quarter': // Cần thêm logic này
                $currentQuarter = ceil($now->month / 3);
                $startOfQuarter = $now->copy()->setMonth(($currentQuarter - 1) * 3 + 1)->startOfMonth();
                $endOfQuarter = $now->copy()->setMonth($currentQuarter * 3)->endOfMonth();
                return [$startOfQuarter, $endOfQuarter];
            case 'last_quarter': // Cần thêm logic này
                $currentQuarter = ceil($now->month / 3);
                if ($currentQuarter === 1) { // Nếu đang quý 1, quý trước là quý 4 năm ngoái
                    $startOfLastQuarter = $now->copy()->subYear()->setMonth(10)->startOfMonth();
                    $endOfLastQuarter = $now->copy()->subYear()->setMonth(12)->endOfMonth();
                } else {
                    $startOfLastQuarter = $now->copy()->setMonth(($currentQuarter - 2) * 3 + 1)->startOfMonth();
                    $endOfLastQuarter = $now->copy()->setMonth(($currentQuarter - 1) * 3)->endOfMonth();
                }
                return [$startOfLastQuarter, $endOfLastQuarter];
            case 'this_year':
                return [$now->copy()->startOfYear(), $now->copy()->endOfYear()];
            case 'last_year':
                return [$now->copy()->subYear()->startOfYear(), $now->copy()->subYear()->endOfYear()];
            case 'all_time':
                return [null, null];
            default:
                return [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()];
        }
    }
}