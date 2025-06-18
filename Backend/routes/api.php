<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\FeaturedProductController;
use App\Http\Controllers\NewArrivalController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\FlashSaleController;
use App\Http\Controllers\ProductDetailController;
use App\Http\Controllers\SearchController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;

// Lấy API của Category Trả về dạng json theo CRUD 
Route::get('/category' ,[CategoryController::class , 'index']);
Route::get('/categorySubMenu' ,[CategoryController::class , 'category_cha_con']);
Route::get('/categorySubMenu/{id}/products' ,[CategoryController::class , 'category_cha_con']);

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
Route::get('/productDetail/{productId}', [ProductDetailController::class, 'show']);
//api cho itemproducst
Route::get('/related-products', [ProductController::class, 'getRelatedProducts']);
Route::get('/products/{currentProductId}/related', [ProductController::class, 'getRelatedProducts']);
// router tìm kiếm lọc sản phẩm 
Route::get('/search/suggest', [SearchController::class, 'suggest']);
Route::get('/search', [SearchController::class, 'search']);
// API 1: Lấy các tùy chọn cho bộ lọc (danh mục, brand, khoảng giá...)
// Frontend sẽ gọi API này để lấy dữ liệu xây dựng nên thanh sidebar.
// Ví dụ cách gọi từ Frontend: /api/filters/available?base_category_id=1
Route::get('/filters/available', [CategoryController::class, 'getAvailableFilters']);

// API 2: Lấy danh sách sản phẩm đã được lọc theo các tiêu chí
// Frontend sẽ gọi API này để hiển thị danh sách sản phẩm chính.
// Ví dụ cách gọi từ Frontend: /api/products/filter?categories=5,8&sort=price_asc&page=1
Route::get('/products/filter', [CategoryController::class, 'filterProducts']);
//api router cho sản phẩm nổi bật cho category 
Route::get('/featuredRelated-products/{id}', [FeaturedProductController::class, 'getRelatedProducts']);
Route::get('/categories/{category}/products', [CategoryController::class, 'showProductsCategory']);
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

