<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SellerOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\utils\CategoryUtil;
use Illuminate\Support\Collection;

class StatisticsController extends Controller
{
  function calculateChange($current, $previous)
  {
    $current = (int) ($current ?? 0);
    $previous = (int) ($previous ?? 0);

    if ($previous == 0) {
      if ($current == 0) {
        $percent = 0;
        $type = 'no_change';
      } else {
        $percent = null;
        $type = 'increase';
      }
    } else {
      $percent = (($current - $previous) / $previous) * 100;
      $type = $percent >= 0 ? 'increase' : 'decrease';
    }

    return [
      'changeType' => $type,
      'percent' => $percent !== null ? round(abs($percent), 2) : '0'
    ];
  }

  function caculaterQuantityProduct($shopID, $startDate, $endDate, $startPrev, $endPrev, $daysCount)
  {
    if ($shopID) {
      function caculater($shopID, $startDate, $endDate)
      {
        $data = DB::table('ordersbuyer as ob')
          ->join('ordersseller as os', 'ob.OrderID', '=', 'os.OrderID')
          ->join('orderitems as oi', 'os.SellerOrderID', '=', 'oi.SellerOrderID')
          ->select(
            DB::raw("SUM(CASE WHEN os.Status = 'Completed' THEN oi.Quantity ELSE 0 END) AS sold_products"),
            DB::raw("SUM(CASE WHEN os.Status = 'Returned' THEN oi.Quantity ELSE 0 END) AS returned_products"),
            DB::raw("SUM(CASE WHEN os.Status IN ('CancelledBySeller','CancelledByBuyer') THEN oi.Quantity ELSE 0 END) AS cancel_products")
          )
          ->where('os.ShopID', $shopID)
          ->whereBetween('ob.OrderDate', [$startDate, $endDate])
          ->first();

        return (object) [
          'sold_products' => (int) $data->sold_products,
          'returned_products' => (int) $data->returned_products,
          'cancel_products' => (int) $data->cancel_products,
          'total_products' => (int) $data->sold_products + (int) $data->returned_products + (int) $data->cancel_products
        ];
      }
    }

    $result = caculater($shopID, $startDate, $endDate) ?? (object) [
      'sold_products' => 0,
      'returned_products' => 0,
      'cancel_products' => 0,
      'total_products' => 0
    ];

    $resultPrev = caculater($shopID, $startPrev, $endPrev) ?? (object) [
      'sold_products' => 0,
      'returned_products' => 0,
      'cancel_products' => 0,
      'total_products' => 0
    ];

    $arr = [
      [
        'key' => 'total_products',
        'title' => 'Tổng sản phẩm',
        'prevValue' => $resultPrev->total_products,
        'value' => $result->total_products,
        'unit' => 'Sản phẩm',
        'icon' => 'ShoppingCart',
        'color' => 'green',
      ] + $this->calculateChange($result->total_products, $resultPrev->total_products),

      [
        'key' => 'sold_products',
        'title' => 'Đã bán',
        'prevValue' => $resultPrev->sold_products,
        'value' => $result->sold_products,
        'unit' => 'Sản phẩm',
        'icon' => 'TrendingUp',
        'color' => 'green',
      ] + $this->calculateChange($result->sold_products, $resultPrev->sold_products),

      [
        'key' => 'returned_products',
        'title' => 'Bị trả về',
        'prevValue' => $resultPrev->returned_products,
        'value' => $result->returned_products,
        'unit' => 'Sản phẩm',
        'icon' => 'ArrowDownLeft',
        'color' => 'orange',
      ] + $this->calculateChange($result->returned_products, $resultPrev->returned_products),

      [
        'key' => 'cancel_products',
        'title' => 'Bị hủy',
        'prevValue' => $resultPrev->cancel_products,
        'value' => $result->cancel_products,
        'unit' => 'Sản phẩm',
        'icon' => 'XCircle',
        'color' => 'red',
      ] + $this->calculateChange($result->cancel_products, $resultPrev->cancel_products),
    ];

    // Format lại change thành câu hoàn chỉnh
    foreach ($arr as &$item) {
      $item['change'] = ($item['changeType'] === 'increase' ? 'Tăng ' : 'Giảm ')
        . $item['percent'] . '%  so với ' . $daysCount . ' ngày trước';
      unset($item['percent']);
    }

    return $arr;
  }

  function caculaterQuantityOder($shopID, $startDate, $endDate, $startPrev, $endPrev, $daysCount, $revenueData)
  {
    if ($shopID) {
      function caculater2($shopID, $startDate, $endDate)
      {
        $data = DB::table('ordersbuyer as ob')
          ->join('ordersseller as os', 'ob.OrderID', '=', 'os.OrderID')
          ->select(
            DB::raw("COUNT(DISTINCT CASE WHEN os.Status = 'Completed' THEN os.SellerOrderID END) AS sold_orders"),
            DB::raw("COUNT(DISTINCT CASE WHEN os.Status = 'Returned' THEN os.SellerOrderID END) AS returned_orders"),
            DB::raw("COUNT(DISTINCT CASE WHEN os.Status IN ('CancelledByBuyer','CancelledBySeller') THEN os.SellerOrderID END) AS cancel_orders")
          )
          ->where('os.ShopID', $shopID)
          ->whereBetween('ob.OrderDate', [$startDate, $endDate])
          ->first();

        return (object) [
          'sold_orders' => (int) $data->sold_orders,
          'returned_orders' => (int) $data->returned_orders,
          'cancel_orders' => (int) $data->cancel_orders,
        ];
      }
    }

    $result = caculater2($shopID, $startDate, $endDate) ?? (object) [
      'sold_orders' => 0,
      'returned_orders' => 0,
      'cancel_orders' => 0
    ];

    $resultPrev = caculater2($shopID, $startPrev, $endPrev) ?? (object) [
      'sold_orders' => 0,
      'returned_orders' => 0,
      'cancel_orders' => 0
    ];

    $arr = [
      [
        'key' => 'total_revenue',
        'title' => 'Tổng doanh thu',
        'prevValue' => (int) $revenueData->previous,
        'value' => (int) $revenueData->current,
        'unit' => 'VND',
        'icon' => 'DollarSign',
        'color' => 'green',
      ] + $this->calculateChange($revenueData->current, $revenueData->previous),

      [
        'key' => 'sold_orders',
        'title' => 'Đã bán',
        'prevValue' => $resultPrev->sold_orders,
        'value' => $result->sold_orders,
        'unit' => 'Đơn hàng',
        'icon' => 'TrendingUp',
        'color' => 'green',
      ] + $this->calculateChange($result->sold_orders, $resultPrev->sold_orders),

      [
        'key' => 'returned_orders',
        'title' => 'Bị trả về',
        'prevValue' => $resultPrev->returned_orders,
        'value' => $result->returned_orders,
        'unit' => 'Đơn hàng',
        'icon' => 'RotateCcw',
        'color' => 'orange',
      ] + $this->calculateChange($result->returned_orders, $resultPrev->returned_orders),

      [
        'key' => 'cancel_orders',
        'title' => 'Bị hủy',
        'prevValue' => $resultPrev->cancel_orders,
        'value' => $result->cancel_orders,
        'unit' => 'Đơn hàng',
        'icon' => 'XCircle',
        'color' => 'red',
      ] + $this->calculateChange($result->cancel_orders, $resultPrev->cancel_orders)
    ];

    // Format lại change thành câu hoàn chỉnh
    foreach ($arr as &$item) {
      $item['change'] = ($item['changeType'] === 'increase' ? 'Tăng ' : 'Giảm ')
        . $item['percent'] . '%  so với ' . $daysCount . ' ngày trước';
      unset($item['percent']);
    }

    return $arr;
  }

  // Function main of analytic page 
  public function getRevenueByDate(Request $req)
  {
    $user = Auth::user();
    $startDate = $req->startDate
      ? Carbon::parse($req->startDate)->startOfDay()
      : Carbon::now()->startOfMonth();

    $endDate = $req->endDate
      ? Carbon::parse($req->endDate)->endOfDay()
      : Carbon::now()->endOfMonth();

    $shopID = DB::table('Shops')
      ->where('UserID', $user->UserID)
      ->value('ShopID');

    $daysCount = ceil($startDate->diffInDays($endDate));

    $startPrev = $startDate->copy()->subDays($daysCount);
    $endPrev = $startDate->copy()->subDay()->endOfDay();

    $startPrevFormat = date("d/m/Y H:i", strtotime($startPrev));
    $endPrevFormat = date("d/m/Y H:i", strtotime($endPrev));
    $startDateFormat = date("d/m/Y H:i", strtotime($startDate));
    $endDateFormat = date("d/m/Y H:i", strtotime($endDate));

    $dateCompare = "{$daysCount} ngày trước, từ {$startPrevFormat} đến ngày {$endPrevFormat}, so với {$startDateFormat} đến ngày {$endDateFormat}";

    if (!$shopID) {
      return response()->json(['message' => 'Shop not found'], 404);
    }

    $summaryByShop = null;
    if ($shopID) {
      $summaryByShop = DB::table('ordersbuyer as ob')
        ->join('ordersseller as os', 'os.OrderID', '=', 'ob.OrderID')
        ->join('shops as s', 'os.ShopID', '=', 's.ShopID')
        ->select(
          's.ShopID',
          's.ShopName',
          'os.SellerOrderID',
          DB::raw('SUM(os.SubtotalAmount) AS TotalRevenue')
        )
        ->whereBetween('ob.OrderDate', [$startDate, $endDate])
        ->where('s.ShopID', $shopID)
        ->where('os.Status', 'Completed')
        ->first();

      $summaryByShop2 = DB::table('ordersbuyer as ob')
        ->join('ordersseller as os', 'os.OrderID', '=', 'ob.OrderID')
        ->join('shops as s', 'os.ShopID', '=', 's.ShopID')
        ->select(
          's.ShopID',
          's.ShopName',
          'os.SellerOrderID',
          DB::raw('SUM(os.SubtotalAmount) AS TotalRevenue')
        )
        ->whereBetween('ob.OrderDate', [$startPrev, $endPrev])
        ->where('s.ShopID', $shopID)
        ->where('os.Status', 'Completed')
        ->first();

    }

    $RevenueData = (object) [
      "current" => (int) ($summaryByShop->TotalRevenue ?? 0),
      "previous" => (int) ($summaryByShop2->TotalRevenue ?? 0)
    ];

    // Single order pie chart calculator
    $summaryDataChart = $this->caculaterQuantityOder($shopID, $startDate, $endDate, $startPrev, $endPrev, $daysCount, $RevenueData);

    // Caculate quantity product sold
    $sumaryProduct = $this->caculaterQuantityProduct($shopID, $startDate, $endDate, $startPrev, $endPrev, $daysCount);

    $sortField = "TotalRevenue";
    $sortDirection = "asc";

    if ($req->sort) {
      [$sortField, $sortDirection] = explode('-', $req->sort);
    }

    // Oder list get by date
    $listOrderDate = null;
    if ($shopID) {
      $sql = "
        WITH revenue AS (
            SELECT 
                DATE(ob.OrderDate) AS OrderDate,
                COUNT(DISTINCT os.SellerOrderID) AS OrderNumber,
                SUM(os.SubtotalAmount) AS TotalRevenue
            FROM ordersbuyer AS ob
            INNER JOIN ordersseller AS os ON ob.OrderID = os.OrderID
            WHERE ob.OrderDate BETWEEN ? AND ?
              AND os.ShopID = ?
              AND os.Status = 'Completed'
            GROUP BY DATE(ob.OrderDate)
        ),
        quantity AS (
            SELECT 
                DATE(ob.OrderDate) AS OrderDate,
                SUM(oi.Quantity) AS NumProductsSold
            FROM ordersbuyer AS ob
            INNER JOIN ordersseller AS os ON ob.OrderID = os.OrderID
            INNER JOIN orderitems AS oi ON os.SellerOrderID = oi.SellerOrderID
            WHERE ob.OrderDate BETWEEN ? AND ?
              AND os.ShopID = ?
              AND os.Status = 'Completed'
            GROUP BY DATE(ob.OrderDate)
        )
        SELECT 
            r.OrderDate,
            r.OrderNumber,
            r.TotalRevenue,
            q.NumProductsSold
        FROM revenue r
        JOIN quantity q ON r.OrderDate = q.OrderDate
        ORDER BY $sortField $sortDirection";
      $listOrderDate = collect(DB::select($sql, [$startDate, $endDate, $shopID, $startDate, $endDate, $shopID]));
    }

    $quantityDisplay = 20;

    if ($req->display_quantity) {
      $quantityDisplay = $req->display_quantity;
    }

    $pagination = [
      'currentPage' => 1,
      'limitItem' => $quantityDisplay,
      'skipRecords' => 0,
      'totalPage' => 0
    ];

    $totalRecords = $listOrderDate->count();
    CategoryUtil::pagination($req, $pagination, $totalRecords);

    $listOrderDate = $listOrderDate->slice($pagination['skipRecords'], $pagination['limitItem'])->values();

    return response()->json([
      'summaryByShop' => $summaryByShop,
      'dateCompare' => $dateCompare,
      'summaryDataChart' => $summaryDataChart,
      'sumaryProduct' => $sumaryProduct,
      'summaryByDate' => $listOrderDate,
      'pagination' => $pagination,
    ]);
  }

  public function getOrderByDate(Request $req)
  {
    $date = $req->input('date');
    $user = Auth::user();

    $shopID = DB::table('Shops')
      ->where('UserID', $user->UserID)
      ->value('ShopID');

    if (!$shopID) {
      return response()->json(['message' => 'Shop not found'], 404);
    }

    if (!$date) {
      return response()->json([
        'error' => 'Missing required parameter: date'
      ], 400);
    }

    $orders = DB::table('ordersbuyer as ob')
      ->distinct()
      ->select(
        'ob.OrderID',
        'ob.OrderCode',
        'u.FullName as BuyerName',
        'ob.OrderDate',
        'os.SubtotalAmount as TotalAmount',
        'os.Status as OverallStatus',
        'os.ShopID'
      )
      ->join('users as u', 'ob.UserID', '=', 'u.UserID')
      ->join('ordersseller as os', 'ob.OrderID', '=', 'os.OrderID')
      ->join('orderitems as oi', 'os.SellerOrderID', '=', 'oi.SellerOrderID')
      ->where('os.ShopID', $shopID)
      ->whereDate('ob.OrderDate', $date)
      ->where('os.Status', 'Completed')
      ->get();

    return response()->json($orders);
  }

  public function getOrdersByAction(Request $req)
  {
    $user = Auth::user();

    $startDate = $req->startDate
      ? $req->startDate . ' 00:00:00'
      : Carbon::now()->startOfMonth()->format('Y-m-d H:i:s');

    $endDate = $req->endDate
      ? $req->endDate . ' 23:59:59'
      : Carbon::now()->endOfMonth()->format('Y-m-d H:i:s');

    $shopID = DB::table('shops')
      ->where('UserID', $user->UserID)
      ->value('ShopID');

    if (!$shopID) {
      return response()->json(['message' => 'Shop not found'], 404);
    }

    $action = $req->input('action');

    $ordersQuery = DB::table('ordersbuyer as ob')
      ->join('ordersseller as os', 'os.OrderID', '=', 'ob.OrderID')
      ->join('users as u', 'ob.UserID', '=', 'u.UserID')
      ->join('orderitems as oi', 'oi.SellerOrderID', '=', 'os.SellerOrderID')
      ->select(
        'ob.OrderID',
        'ob.OrderCode',
        'os.SellerOrderID',
        'u.FullName as CustomerName',
        'ob.OrderDate',
        'os.TotalAmount',
        'os.Status as ShopStatus',
        DB::raw('SUM(oi.Quantity) as ProductCount')
      )
      ->where('os.ShopID', $shopID)
      ->whereBetween('ob.OrderDate', [$startDate, $endDate])
      ->groupBy('ob.OrderID', 'os.SellerOrderID');

    switch ($action) {
      case 'orderReturn':
        $ordersQuery->whereIn('os.Status', ['Returned']);
        break;

      case 'orderCancel':
        $ordersQuery->whereIn('os.Status', ['CancelledByBuyer', 'CancelledBySeller']);
        break;

      case 'orderCompleted':
      default:
        $ordersQuery->where('os.Status', 'Completed');
        break;
    }

    $orders = $ordersQuery->get();
    return response()->json([
      'action' => $action,
      'orders' => $orders
    ]);
  }

  public function showOderDetail(Request $request, $id)
  {
    $user = Auth::user();

    $shopID = DB::table('shops')
      ->where('UserID', $user->UserID)
      ->value('ShopID');

    if (!$shopID) {
      return response()->json(['message' => 'Shop not found'], 404);
    }
    // Lấy đơn hàng
    $order = DB::table('ordersbuyer as o')
      ->join('users as u', 'o.UserID', '=', 'u.UserID')
      ->join('ordersseller as os', 'o.OrderID', '=', 'os.OrderID')
      ->join('addresses as a', 'o.ShippingAddressID', '=', 'a.AddressID')
      ->select(
        'o.OrderID',
        'os.SellerOrdercode as OrderCode',  
        'o.OrderDate',
        'os.TotalAmount',
        'os.SubtotalAmount',
        'o.ShippingFee',
        'o.DiscountAmount',
        'o.PaymentMethod',
        'o.paidAt',
        'o.PaymentStatus',
        'o.ShippingFullName',
        'o.ShippingPhoneNumber',
        'u.FullName as BuyerName',
        'u.Email as BuyerEmail',
        'os.Status as OverallStatus',
        DB::raw("CONCAT_WS(', ', a.Street, a.Ward, a.District, a.City) as ShippingAddress")
      )
      ->where('o.OrderID', $id)
      ->where('os.ShopID', $shopID)
      ->first();


    if (!$order) {
      return response()->json(['message' => 'Order not found'], 404);
    }

    // Lấy các sản phẩm trong đơn hàng
    $items = DB::table('orderitems as oi')
      ->join('ordersseller as os', 'oi.SellerOrderID', '=', 'os.SellerOrderID')
      ->join('productvariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
      ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
      ->select(
        'oi.OrderItemID',
        'p.Name as ProductName',
        'pv.SKU',
        'pv.ImageURL',
        'oi.Quantity',
        'oi.PriceAtPurchase',
        'oi.Subtotal',
        'oi.IsFlashSaleItem',
        'oi.ReturnStatus',
        'os.Status as ShopStatus',
        'os.ShopID'
      )
      ->where('os.OrderID', $id)
      ->where('os.ShopID', $shopID)
      ->get();

    return response()->json([
      'order' => $order,
      'items' => $items
    ]);
  }


}

