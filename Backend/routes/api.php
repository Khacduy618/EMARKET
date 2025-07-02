<?php
use App\Http\Controllers\CategoryController;
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
use App\Http\Controllers\SellerRegisterController;
use App\Http\Controllers\ShopCategoryController ; 
use App\Http\Controllers\ShopProductController ;

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
    Route::middleware('auth:sanctum')->group(function () {
    Route::get('/seller/register', [SellerRegisterController::class, 'showRegistrationForm']);
    Route::post('/seller/register', [SellerRegisterController::class, 'register']);
    Route::get('/seller/dashboard', [SellerRegisterController::class, 'dashboard']); 
});

Route::middleware('auth:sanctum' )->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::middleware('seller')->group(function () {
        Route::get('/platform-categories', [ShopCategoryController::class, 'getPlatformCategories']);
        Route::get('/shop-categories', [ShopCategoryController::class, 'getShopCategories']);
        Route::post('/shop-categories', [ShopCategoryController::class, 'registerCategory']);
        Route::delete('/shop-categories/{shopCategoryID}', [ShopCategoryController::class, 'deleteCategory']);
        Route::get('/products', [ShopProductController::class, 'index']);
        Route::post('/shop/products', [ShopProductController::class, 'addProduct']);
        Route::get('/shop/products/{productID}', [ShopProductController::class, 'showProduct']);
        Route::post('/shop/products/{productId}', [ShopProductController::class, 'updateProduct']) ; 
        Route::delete('/shop/products/{productID}', [ShopProductController::class, 'destroy']);
        Route::get('/attributes/{categoryID}', [ShopProductController::class, 'getAttributes']);
        Route::get('/shop/products/{productID}/attribute-values', [ShopProductController::class, 'getProductAttributeValues']);
    });
});