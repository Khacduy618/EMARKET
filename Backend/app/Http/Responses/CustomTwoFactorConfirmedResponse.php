<?php
namespace App\Http\Responses;

use Laravel\Fortify\Contracts\TwoFactorConfirmedResponse as Contract;
use Illuminate\Http\JsonResponse;

class CustomTwoFactorConfirmedResponse implements Contract
{
    public function toResponse($request): JsonResponse
    {
        return response()->json([
            'message' => '2FA đã được xác nhận.',
        ]);
    }
}
