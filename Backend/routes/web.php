<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
Route::get('/v1/test', function () {
    return response()->json(['status' => 'OK']);
});
Route::get('/health-check', function () {
    return response()->json(['status' => 'OK', 'message' => 'Laravel API is running!']);
});
