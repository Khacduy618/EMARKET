<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Session;

class CustomLoginResponse implements LoginResponseContract
{
    public function toResponse($request): JsonResponse
    {
        // Fortify lưu trạng thái two-factor trong session nếu bật
        $twoFactorEnabled = Session::get('login.id') !== null;

        return response()->json([
            'message' => 'Đăng nhập thành công',
            'user' => $request->user(),
            'two_factor' => $twoFactorEnabled,
            // 'request' => $request, // WARN:Hiển thị toàn bộ dữ liệu yêu cầu gửi lên để test thôi
        ]);
    }
}
