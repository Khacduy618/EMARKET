<?php
namespace App\Http\Responses;

use Laravel\Fortify\Contracts\TwoFactorLoginResponse as Contract;
use Illuminate\Http\JsonResponse;

class CustomTwoFactorLoginResponse implements Contract
{
    public function toResponse($request): JsonResponse
    {
        return response()->json([
            'two_factor' => true,
            'message' => 'Yêu cầu mã 2FA.',
        ]);
    }
}
