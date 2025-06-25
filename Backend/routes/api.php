<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NewArrivalController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\FlashSaleController;
use App\Http\Controllers\ProductDetailController;
use App\Http\Controllers\SearchController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CartController;
use App\Http\Controllers\VoucherController;

use Laravel\Fortify\Http\Controllers\NewPasswordController;

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

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');
// Route::post('/register', [AuthController::class, 'register']);
// Route::post('/login',    [AuthController::class, 'login']);
// Route::middleware('auth:sanctum')->group(function (){
//     // Auth routes already defined above, removing duplicates
//     Route::get('/me', [AuthController::class, 'me']);
//     Route::post('/logout', [AuthController::class, 'logout']);
//
//     // Cart routes - require authentication
//
//     Route::get('/cart', [CartController::class, 'index']);
//     Route::post('/cart/items', [CartController::class, 'addItem']);
//     Route::put('/cart/items/{cartItemId}', [CartController::class, 'updateItem']);
//     Route::delete('/cart/items/{cartItemId}', [CartController::class, 'removeItem']);
//     //voucher routes
//      Route::get('/vouchers', [VoucherController::class, 'index']);
//
// });
    Route::get('/product-attributes/{productId}', [CartController::class, 'getProductAttributes']);

// Route::get('/reset-password/{token}', [NewPasswordController::class, 'create'])
//     ->middleware(['guest'])
//     ->name('password.reset');


Route::get('/reset-password/{token}', function($token) {
    return $token;
})->middleware(['guest'])->name('password.reset');


Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::get('/login', [AuthController::class, 'loginRedirect'])->name('login');

// Route::post('/login', [AuthController::class, 'login']);

Route::post('/email/resend', [AuthController::class, 'resendVerificationEmail']);

Route::get('/csrf-init', function () {
    return response()->json(['message' => 'CSRF cookie set.']);
});

// Route me của bạn BẮT BUỘC phải CÓ middleware auth:sanctum
Route::get('/me', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Route::middleware('auth:sanctum')->put('/user/password', [AuthController::class, 'updatePassword']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/debug-origin', function (Request $request) {
    // Trả về header 'Origin' mà Laravel nhận được từ request
    $origin = $request->header('Origin');

    // So sánh nó với giá trị chúng ta mong đợi
    $expectedDomain = 'http://' . config('sanctum.stateful')[0];

    return response()->json([
        'message' => 'Origin Header Debug',
        'origin_header_received' => $origin,
        'expected_origin_from_config' => $expectedDomain,
        'do_they_match' => $origin === $expectedDomain,
    ]);
});
