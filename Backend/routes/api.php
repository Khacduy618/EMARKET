<?php

use App\Http\Controllers\CategoryController; //home

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
use App\Http\Controllers\VoucherController;

use App\Http\Middleware\HandleImage;

use App\Http\Controllers\SellerRegisterController;
use App\Http\Controllers\ShopCategoryController;
use App\Http\Controllers\ShopProductController;
// Lấy API của Category Trả về dạng json theo CRUD 
Route::get('/category', [CategoryController::class, 'index']);
Route::get('/categorySubMenu', [CategoryController::class, 'category_cha_con']);
Route::get('/categorySubMenu/{id}/products', [CategoryController::class, 'category_cha_con']);

Route::post('/CreateCategory', [CategoryController::class, 'store']);
Route::put('/UpdateCategory/{id}', [CategoryController::class, 'update']);
Route::delete('/DeleteCategory/{id}', [CategoryController::class, 'destroy']);
// Lấy API của Products Trả về dạng json theo CRUD 
Route::get('/Products', [ProductController::class, 'index']);
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
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
  // Auth routes already defined above, removing duplicates
  Route::get('/me', [AuthController::class, 'me']);
  Route::post('/logout', [AuthController::class, 'logout']);

  // Cart routes - require authentication

  Route::get('/cart', [CartController::class, 'index']);
  Route::post('/cart/items', [CartController::class, 'addItem']);
  Route::put('/cart/items/{cartItemId}', [CartController::class, 'updateItem']);
  Route::delete('/cart/items/{cartItemId}', [CartController::class, 'removeItem']);
  //voucher routes
  Route::get('/vouchers', [VoucherController::class, 'index']);

});

Route::get('/product-attributes/{productId}', [CartController::class, 'getProductAttributes']);


Route::middleware('auth:sanctum')->group(function () {
  Route::get('/seller/register', [SellerRegisterController::class, 'showRegistrationForm']);
  Route::post('/seller/register', [SellerRegisterController::class, 'register']);
  Route::get('/seller/dashboard', [SellerRegisterController::class, 'dashboard']);
});

Route::middleware('auth:sanctum')->group(function () {
  Route::get('/platform-categories', [ShopCategoryController::class, 'getPlatformCategories']);
  Route::get('/shop-categories', [ShopCategoryController::class, 'getShopCategories']);
  Route::post('/shop-categories', [ShopCategoryController::class, 'registerCategory']);
  Route::delete('/shop-categories/{shopCategoryID}', [ShopCategoryController::class, 'deleteCategory']);
  Route::get('/products', [ShopProductController::class, 'index']);
  Route::post('/products', [ShopProductController::class, 'store']);
  Route::put('/products/{productID}', [ShopProductController::class, 'update']);
  Route::delete('/products/{productID}', [ShopProductController::class, 'destroy']);
});


use App\Http\Controllers\Admin\CategoryController as AdminCategory;
use App\Http\Controllers\Admin\ShopController as ShopController;
use App\Http\Controllers\Admin\ProductControllers;

use App\Http\Controllers\Admin\StatisticsController; 

/* __________________________________________________________________
  |                            Admin route                           |
  |__________________________________________________________________| */

// Category route
Route::get('/admin/categories/getAllCategory', [AdminCategory::class, "getAllCategory"]);

Route::get('/admin/categories/list', [AdminCategory::class, "index"]);

Route::post('/admin/categories/create', [AdminCategory::class, "createPost"])
  ->middleware(HandleImage::class);

Route::get('/admin/categories/edit/{id}', [AdminCategory::class, "editGet"]);

Route::patch('/admin/categories/update', [AdminCategory::class, "updateCategory"])
  ->middleware(HandleImage::class);

Route::delete('/admin/categories/delete/{id}', [AdminCategory::class, 'deleteCategory']);
// End category route

// Shop route
Route::get('/admin/shops', [ShopController::class, "index"]);

Route::put('/admin/shops/{shopId}/status', [ShopController::class, 'changeStatus']);

Route::get('/admin/shops/{id}', [ShopController::class, 'shopDetail']);
// End Shop route

// Product route
Route::get('/admin/products', [ProductControllers::class, "index"]);

Route::put('/admin/products/{id}/approval-status', [ProductControllers::class, 'updateApprovalStatus']);

Route::get('/admin/products/{id}', [ProductControllers::class, 'detailProduct']);

// End product route




/* ___________________________________________________________________
  |                            Seller route                           |
  |___________________________________________________________________| */

Route::middleware('auth:sanctum')->group(function () {
  Route::get('/seller/register', [SellerRegisterController::class, 'showRegistrationForm']);
  Route::post('/seller/register', [SellerRegisterController::class, 'register']);
  Route::get('/seller/dashboard', [SellerRegisterController::class, 'dashboard']);
});

Route::middleware('auth:sanctum')->group(function () {
  Route::get('/seller/statistics', [StatisticsController::class, "getRevenueByDate"]);
  Route::get('/seller/orders', [StatisticsController::class, "getOrderByDate"]);
  Route::get('/seller/statistics/orders', [StatisticsController::class, 'getOrdersByAction']);
});