<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Illuminate\Http\JsonResponse;

class CustomLoginResponse implements LoginResponseContract
{
    public function toResponse($request): JsonResponse
    {
        return response()->json([
            'message' => 'Đăng nhập thành công',
            'user' => $request->user(),
            'two_factor' => $request,
        ]);
    }
}
