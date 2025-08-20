<?php

namespace App\Http\Controllers\Seller;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\SellerRegisterRequest;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Database\QueryException; // ✅ để ở đây

class SellerRegisterController extends Controller
{
    public function showRegistrationForm()
    {
        $user = Auth::user();
        
        if(is_null($user->two_factor_secret)){
             return response()->json(['message' => 'Bạn chưa xác thực 2 yếu tố.'], 403);
        }
        return response()->json([
            'user' => $user
        ], 200);
    }

   


public function register(Request $request)
{
    // 1) Yêu cầu đăng nhập
    $user = Auth::user();
    if (!$user) {
        return response()->json(['message' => 'Chưa đăng nhập.'], 401);
    }

    // 2) Chuẩn hoá input
    $name = trim(preg_replace('/\s+/', ' ', (string) $request->input('shopName', '')));

    // 3) Validate (bao gồm unique theo cột DB 'ShopName')
    $request->merge(['shopName' => $name]);
    $validated = $request->validate([
        'shopName'       => ['required','string','max:255', Rule::unique('Shops','ShopName')],
        'addressStreet'  => ['required','string','max:255'],
        'addressWard'    => ['required','string','max:255'],
        'addressDistrict'=> ['required','string','max:255'],
        'addressCity'    => ['required','string','max:255'],
        'shopPhone'      => ['required','string','max:15'],
        'logo'           => ['nullable','image','max:2048'],
        'cccdFront'      => ['nullable','image','max:2048'],
        'cccdBack'       => ['nullable','image','max:2048'],
    ]);

    // 4) User đã có shop?
    if (Shop::where('UserID', Auth::id())->exists()) {
        return response()->json(['message' => 'Bạn đã có cửa hàng rồi.'], 409); // Conflict
    }

    // 5) Build dữ liệu lưu
    $shopData = [
        'UserID'          => Auth::id(),
        'ShopName'        => $validated['shopName'],
        'AddressStreet'   => $validated['addressStreet'],
        'AddressWard'     => $validated['addressWard'],
        'AddressDistrict' => $validated['addressDistrict'],
        'AddressCity'     => $validated['addressCity'],
        'ShopPhone'       => $validated['shopPhone'],
        'Level'           => 'Normal',
        'Status'          => 'PendingApproval',
    ];

    if ($request->hasFile('logo')) {
        $shopData['LogoURL'] = $request->file('logo')->store('shop_logos', 'public');
    }
    if ($request->hasFile('cccdFront')) {
        $shopData['Cccd_front'] = $request->file('cccdFront')->store('cccd_front', 'public');
    }
    if ($request->hasFile('cccdBack')) {
        $shopData['Cccd_back'] = $request->file('cccdBack')->store('cccd_back', 'public');
    }

    // 6) Tạo shop + bắt lỗi duplicate ở DB (race condition, khoảng trắng, v.v.)
    try {
        $shop = \App\Models\Shop::create($shopData);
        return response()->json([
            'message' => 'Đăng ký cửa hàng thành công. Vui lòng chờ phê duyệt.',
            'data'    => $shop,
        ], 201);
    } catch (QueryException $e) {
        // MySQL duplicate key
        if ($e->errorInfo[0] === '23000' && (int)($e->errorInfo[1] ?? 0) === 1062) {
            return response()->json(['message' => 'Tên shop đã tồn tại!'], 409);
        }
        throw $e; // các lỗi khác để Laravel xử lý
    }
}


    public function dashboard()
    {
        $user = Auth::user();
        return response()->json([
            'user' => $user,
            'shop' => $user->shop,
        ], 200);
    }
}