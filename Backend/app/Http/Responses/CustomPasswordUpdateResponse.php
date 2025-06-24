<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\PasswordUpdateResponse as Contract;
use Illuminate\Http\JsonResponse;

class CustomPasswordUpdateResponse implements Contract
{
    public function toResponse($request): JsonResponse
    {
        return response()->json([
            'message' => 'Cập nhật mật khẩu thành công.',
            // 'request' => $request->all(),
        ]);
    }
}
