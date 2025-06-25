<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

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

    $shopID = DB::table('shops')
      ->where('UserID', $user->UserID)
      ->value('ShopID');

    if (!$shopID) {
      return response()->json(['message' => 'Shop not found'], 404);
    }

    $summaryByShop = DB::table('ordersbuyer as ob')
      ->join('orderitems as oi', 'ob.OrderID', '=', 'oi.OrderID')
      ->join('productvariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
      ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
      ->join('shops as s', 'p.ShopID', '=', 's.ShopID')
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

    $summaryByDate = DB::table('ordersbuyer as ob')
      ->join('orderitems as oi', 'ob.OrderID', '=', 'oi.OrderID')
      ->join('productvariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
      ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
      ->join('shops as s', 'p.ShopID', '=', 's.ShopID')
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
      ->orderBy('OrderDate')
      ->get();

    return response()->json([
      'summaryByShop' => $summaryByShop,
      'summaryByDate' => $summaryByDate,
    ]);
  }

  public function getOrderByDate(Request $req)
  {
    $date = $req->input('date');
    $user = Auth::user();

    $shopID = DB::table('shops')
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
        'ob.TotalAmount',
        'ob.OverallStatus',
        'p.ShopID'
      )
      ->join('users as u', 'ob.UserID', '=', 'u.UserID')
      ->join('orderitems as oi', 'ob.OrderID', '=', 'oi.OrderID')
      ->join('productvariants as pv', 'oi.VariantID', '=', 'pv.VariantID')
      ->join('products as p', 'pv.ProductID', '=', 'p.ProductID')
      ->where('p.ShopID', $shopID)
      ->whereDate('ob.OrderDate', $date)
      ->where('ob.OverallStatus', 'Completed')
      ->get();

    return response()->json($orders);
  }
}


