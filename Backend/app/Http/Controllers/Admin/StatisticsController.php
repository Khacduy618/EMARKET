<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\utils\CategoryUtil;

class StatisticsController extends Controller
{
  public function getRevenueByDate(Request $req)
  {
    $user = Auth::user();
    $startDate = $req->startDate
      ? $req->startDate . ' 00:00:00'
      : Carbon::now()->startOfMonth()->format('Y-m-d H:i:s');

    $endDate = $req->endDate
      ? $req->endDate . ' 23:59:59'
      : Carbon::now()->endOfMonth()->format('Y-m-d H:i:s');

    $shopID = DB::table('Shops')
      ->where('UserID', $user->UserID)
      ->value('ShopID');

    if (!$shopID) {
      return response()->json(['message' => 'Shop not found'], 404);
    }

    $summaryByShop = DB::table('OrdersBuyer as ob')
      ->join('OrderItems as oi', 'ob.OrderID', '=', 'oi.OrderID')
      ->join('ProductVariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
      ->join('Products as p', 'pv.ProductID', '=', 'p.ProductID')
      ->join('Shops as s', 'p.ShopID', '=', 's.ShopID')
      ->select(
        's.ShopID',
        's.ShopName',
        DB::raw('COUNT(ob.OrderID) AS OrderNumber'),
        DB::raw('SUM(oi.Subtotal) AS TotalRevenue'),
        DB::raw('SUM(oi.Quantity) AS NumProductsSold')
      )
      ->whereBetween('ob.OrderDate', [$startDate, $endDate])
      ->where('s.ShopID', $shopID)
      ->where('ob.OverallStatus', 'Completed')
      ->groupBy('s.ShopID', 's.ShopName')
      ->orderByDesc('TotalRevenue')
      ->first();


    $summaryDataChart = DB::table('OrdersBuyer as ob')
      ->join('OrderItems as oi', 'ob.OrderID', '=', 'oi.OrderID')
      ->join('ProductVariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
      ->join('Products as p', 'pv.ProductID', '=', 'p.ProductID')
      ->select(
        'ob.OverallStatus',
        DB::raw('COUNT(DISTINCT ob.OrderID) AS OrderCount')
      )
      ->where('p.ShopID', $shopID)
      ->whereIn('ob.OverallStatus', ['Returned', 'Completed', 'CancelledByBuyer', 'CancelledBySeller'])
      ->whereBetween('ob.OrderDate', [$startDate, $endDate])
      ->groupBy('ob.OverallStatus')
      ->pluck('OrderCount', 'OverallStatus')
      ->toArray();


    $cancelledTotal = ($summaryDataChart['CancelledByBuyer'] ?? 0) + ($summaryDataChart['CancelledBySeller'] ?? 0);

    unset($summaryDataChart['CancelledByBuyer'], $summaryDataChart['CancelledBySeller']);

    $summaryDataChart['Cancelled'] = $cancelledTotal;

    $sortField = "TotalRevenue";
    $sortDirection = "asc";

    if ($req->sort) {
      [$sortField, $sortDirection] = explode('-', $req->sort);
    }


    $summaryByDate = DB::table('OrdersBuyer as ob')
      ->join('OrderItems as oi', 'ob.OrderID', '=', 'oi.OrderID')
      ->join('ProductVariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
      ->join('Products as p', 'pv.ProductID', '=', 'p.ProductID')
      ->join('Shops as s', 'p.ShopID', '=', 's.ShopID')
      ->select(
        DB::raw('DATE(ob.OrderDate) AS OrderDate'),
        DB::raw('COUNT(DISTINCT ob.OrderID) AS OrderNumber'),
        DB::raw('SUM(oi.Subtotal) AS TotalRevenue'),
        DB::raw('SUM(oi.Quantity) AS NumProductsSold')
      )
      ->whereBetween('ob.OrderDate', [$startDate, $endDate])
      ->where('s.ShopID', $shopID)
      ->where('ob.OverallStatus', 'Completed')
      ->groupBy(DB::raw('DATE(ob.OrderDate)'))
      ->orderBy($sortField, $sortDirection)
      ->get();


    $quantityDisplay = 10;

    if ($req->display_quantity) {
      $quantityDisplay = $req->display_quantity;
    }

    $pagination = [
      'currentPage' => 1,
      'limitItem' => $quantityDisplay,
      'skipRecords' => 0,
      'totalPage' => 0
    ];

    $totalRecords = $summaryByDate->count();
    CategoryUtil::pagination($req, $pagination, $totalRecords);

    $summaryByDate = $summaryByDate->slice($pagination['skipRecords'], $pagination['limitItem'])->values();


    return response()->json([
      'summaryByShop' => $summaryByShop,
      'summaryDataChart' => $summaryDataChart,
      'summaryByDate' => $summaryByDate,
      'pagination' => $pagination,
    ]);
  }

  public function getOrderByDate(Request $req) {
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

    $orders = DB::table('OrdersBuyer as ob')
      ->distinct()
      ->select(
        'ob.OrderID',
        'ob.OrderCode',
        'u.FullName as BuyerName',
        'ob.OrderDate',
        'ob.TotalAmount',
        'ob.OverallStatus',
        'p.ShopID'
      )
      ->join('Users as u', 'ob.UserID', '=', 'u.UserID')
      ->join('OrderItems as oi', 'ob.OrderID', '=', 'oi.OrderID')
      ->join('ProductVariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
      ->join('Products as p', 'pv.ProductID', '=', 'p.ProductID')
      ->where('p.ShopID', $shopID)
      ->whereDate('ob.OrderDate', $date)
      ->where('ob.OverallStatus', 'Completed')
      ->get();

    return response()->json($orders);
  }

  public function getOrdersByAction(Request $req) {
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
      ->select(
        'ob.OrderID',
        'ob.OrderCode',
        'u.FullName as CustomerName',
        'ob.OrderDate',
        'ob.TotalAmount',
        'ob.OverallStatus',
        DB::raw('COUNT(oi.OrderID) as ProductCount')
      )
      ->join('users as u', 'ob.UserID', '=', 'u.UserID')
      ->join('orderitems as oi', 'ob.OrderID', '=', 'oi.OrderID')
      ->join('productvariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
      ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
      ->where('p.ShopID', $shopID)
      ->whereBetween('ob.OrderDate', [$startDate, $endDate])
      ->groupBy('ob.OrderID', 'ob.OrderCode', 'u.FullName', 'ob.OrderDate', 'ob.TotalAmount', 'ob.OverallStatus');

    switch ($action) {
      case 'orderReturn':
        $ordersQuery->where('ob.OverallStatus', 'Returned');
        break;

      case 'orderCancel':
        $ordersQuery->whereIn('ob.OverallStatus', ['CancelledByBuyer', 'CancelledBySeller']);
        break;

      case 'orderCompleted':
      default:
        $ordersQuery->where('ob.OverallStatus', 'Completed');
        break;
    }

    $orders = $ordersQuery->get();

    return response()->json([
      'action' => $action,
      'orders' => $orders
    ]);
  }



}


