<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Illuminate\Http\JsonResponse;

class CustomRegisterResponse implements RegisterResponseContract
{
    public function toResponse($request): JsonResponse
    {
        return response()->json([
            'message' => 'Đăng ký thành công. Vui lòng kiểm tra email để xác minh tài khoản.',
            'user' => $request->user(), // Đã được đăng nhập sau khi tạo
            'email_verification_required' => ! $request->user()?->hasVerifiedEmail(),
        ]);
    }
}
