<?php
namespace App\Http\Responses;

use Laravel\Fortify\Contracts\SuccessfulPasswordResetLinkRequestResponse as SendPasswordResetLinkResponse;
use Illuminate\Http\JsonResponse;

class CustomPasswordResetLinkResponse implements SendPasswordResetLinkResponse
{
    public function toResponse($request): JsonResponse
    {
        return response()->json([
            'message' => 'Liên kết đặt lại mật khẩu đã được gửi tới email của bạn.',
            // 'request' => $request->all()
        ]);
    }
}
