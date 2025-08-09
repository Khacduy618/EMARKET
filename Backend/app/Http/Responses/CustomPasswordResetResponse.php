<?php
namespace App\Http\Responses;

use Laravel\Fortify\Contracts\PasswordResetResponse as Contract;
use Illuminate\Http\JsonResponse;

class CustomPasswordResetResponse implements Contract
{
    public function toResponse($request): JsonResponse
    {
        return response()->json([
            'message' => 'Đặt lại mật khẩu thành công.',
            // 'request' => $request->all(),
        ]);
    }
}
