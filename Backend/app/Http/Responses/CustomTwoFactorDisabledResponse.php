<?php
namespace App\Http\Responses;

use Laravel\Fortify\Contracts\TwoFactorDisabledResponse as Contract;
use Illuminate\Http\JsonResponse;

class CustomTwoFactorDisabledResponse implements Contract
{
    public function toResponse($request): JsonResponse
    {
        return response()->json([
            'message' => '2FA đã được tắt.',
        ]);
    }
}
