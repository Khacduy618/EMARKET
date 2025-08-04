<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
Route::get('/api/v1/products', [ProductController::class, 'index']);
Route::get('/v1/test', function () {
    return response()->json(['status' => 'OK']);
});
Route::get('/health-check', function () {
    return response()->json(['status' => 'OK', 'message' => 'Laravel API is running!']);
});

// Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
// Route::post('/login', [AuthController::class, 'logintest']);
