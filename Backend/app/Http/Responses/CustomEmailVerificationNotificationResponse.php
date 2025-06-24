<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\EmailVerificationNotificationSentResponse as EmailVerificationNotificationResponseContract;
use Illuminate\Http\JsonResponse;

class CustomEmailVerificationNotificationResponse implements EmailVerificationNotificationResponseContract
{
    public function toResponse($request): JsonResponse
    {
        return response()->json([
            'message' => 'Email xác minh đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn.',
            // 'request' => $request->all(),
        ]);
    }
}
