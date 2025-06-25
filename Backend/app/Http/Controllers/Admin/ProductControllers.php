<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductControllers extends Controller {
  public function index(): JsonResponse
  {
    $products = DB::table('products')
      ->leftJoin('productimages', 'products.ProductID', '=', 'productimages.ProductID')
      ->select('products.*', 'productimages.ImageURL')
      ->where('productimages.IsPrimary', 1)
      ->get();

    return response()->json($products);
  }


}