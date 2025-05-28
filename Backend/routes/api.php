<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\FlashSaleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
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
Route::get('/flashSales', [ProductController::class, 'index']);
/////////////////////////////
Route::get('/flash-sales/active', [FlashSaleController::class, 'getFlashSalesGroupedBySlot']);
// router lấy api banner cho trang chủ
Route::get('/banners', [BannerController::class, 'index']);