<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\SellerRegisterRequest;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class SellerRegisterController extends Controller
{
    public function showRegistrationForm()
    {
        // $user = Auth::user();
        $user = User::where('Email', 'buyer01@example.com')->first();
        return response()->json([
            'user' => $user
        ], 200);
    }

    public function register(SellerRegisterRequest $request)
    {
        // $user = Auth::user();
        // hard-codede use for testing 
        $user = User::where('Email', 'buyer01@example.com')->first();
        if ($user->Role === 'Seller' && $user->shop) {
            return response()->json([
                'message' => 'Bạn đã đăng ký làm người bán',
            ], 400);
        }

        // $user->update(['Role' => 'Seller']);

        $shop = Shop::create([
            'UserID' => $user->UserID,
            'ShopName' => $request->shop_name,
            'Description' => $request->description,
            'ShopAddress' => $request->shop_address,
            'ShopPhone' => $request->shop_phone,
            'LogoURL' => $request->logo_url,
            'CoverImageURL' => $request->cover_image_url,
            'Status' => 'PendingApproval',
        ]);
      

        return response()->json([
            'message' => 'Đăng ký bán hàng thành công! Vui lòng chờ phê duyệt.',
            'shop' => $shop,
        ], 201);
    }
    // public function register(SellerRegisterRequest $request)
    // {
    //     $user = User::where('Email', 'buyer01@example.com')->first();
    //     $shop = Shop::create([
    //         'UserID' => $user->UserID, // Sử dụng ID của người dùng đã đăng nhập
    //         'ShopName' => $request->shop_name,
    //         'Description' => $request->description,
    //         'ShopAddress' => $request->shop_address,
    //         'ShopPhone' => $request->shop_phone,
    //         'LogoURL' => $request->logo_url,
    //         'CoverImageURL' => $request->cover_image_url,
    //         'Status' => 'PendingApproval',
    //         // Không cần UserID_Owner
    //     ]);

    //     return response()->json([
    //         'message' => 'Đăng ký bán hàng thành công! Vui lòng chờ phê duyệt.',
    //         'shop' => $shop,
    //     ], 201);
    // }

    public function dashboard()
    {
        // $user = Auth::user();
        $user = User::where('Email', 'buyer01@example.com')->first();
        return response()->json([
            'user' => $user,
            'shop' => $user->shop,
        ], 200);
    }
}