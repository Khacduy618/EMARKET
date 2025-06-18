<?php

use App\Http\Controllers\CategoryController; //home

use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\NewArrivalController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\FlashSaleController;
use App\Http\Controllers\ProductDetailController;
use App\Http\Controllers\SearchController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;

use App\Http\Controllers\Admin\CategoryController AS AdminCategory; //admin
use App\Http\Controllers\Admin\StatisticsController; //admin
use App\Http\Middleware\HandleImage;


// Lấy API của Category Trả về dạng json theo CRUD 
Route::get('/category' ,[CategoryController::class , 'index']);
Route::get('/categorySubMenu' ,[CategoryController::class , 'category_cha_con']);

Route::post('/CreateCategory', [CategoryController::class, 'store']);
Route::put('/UpdateCategory/{id}', [CategoryController::class, 'update']);
Route::delete('/DeleteCategory/{id}', [CategoryController::class, 'destroy']);
// Lấy API của Products Trả về dạng json theo CRUD 
Route::get('/Products' ,[ProductController::class , 'index']);
Route::post('/CreateProducts', [ProductController::class, 'store']);
Route::put('/UpdateProducts/{id}', [ProductController::class, 'update']);
Route::delete('/DeleteProducts/{id}', [ProductController::class, 'destroy']);
//API trả về giảm giá và % của product
Route::get('/ProductFinalPrice', [ProductController::class, 'ProductFinalPrice']);
// Laravel API – GET /api/products/best-selling
Route::get('/products/best-selling', [ProductController::class, 'bestSelling']);
//flash sale 
// Route::get('/flashSales', [ProductController::class, 'index']);
/////////////////////////////
Route::get('/flash-sales/active', [FlashSaleController::class, 'getFlashSalesGroupedBySlot']);
// router lấy api banner cho trang chủ
Route::get('/banners', [BannerController::class, 'index']);
//router cho sản phẩm mới nhất
Route::get('/new-arrivals', [NewArrivalController::class, 'index']);
Route::get('/products/{productId}', [ProductDetailController::class, 'show']);
// router tìm kiếm lọc sản phẩm 
Route::get('/search/suggest', [SearchController::class, 'suggest']);
Route::get('/search', [SearchController::class, 'search']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function (){
    // Auth routes already defined above, removing duplicates
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Cart routes - require authentication
    
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/items', [CartController::class, 'addItem']);
    Route::put('/cart/items/{cartItemId}', [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{cartItemId}', [CartController::class, 'removeItem']);

});
    Route::get('/product-attributes/{productId}', [CartController::class, 'getProductAttributes']);



//admin

Route::get('/admin/categories/getAllCategory', [AdminCategory::class, "getAllCategory"]);

Route::get('/admin/categories/list', [AdminCategory::class, "index"]);

Route::post('/admin/categories/create', [AdminCategory::class, "createPost"])
  ->middleware(HandleImage::class);

Route::get('/admin/categories/edit/{id}', [AdminCategory::class, "editGet"]);

Route::patch('/admin/categories/update', [AdminCategory::class, "updateCategory"])
  ->middleware(HandleImage::class);

Route::delete('/admin/categories/delete/{id}', [AdminCategory::class, 'deleteCategory']);

Route::middleware('auth:sanctum')->group(function () { 
  Route::get('/seller/statistics', [StatisticsController::class, "getRevenueByDate"]);
  Route::get('/seller/orders', [StatisticsController::class, "getOrderByDate"]);
});