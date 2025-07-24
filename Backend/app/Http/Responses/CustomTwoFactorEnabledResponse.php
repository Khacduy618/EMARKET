<?php
namespace App\Http\Responses;

use Laravel\Fortify\Contracts\TwoFactorEnabledResponse as Contract;
use Illuminate\Http\JsonResponse;

class CustomTwoFactorEnabledResponse implements Contract
{
    public function toResponse($request): JsonResponse
    {
        return response()->json([
            'message' => '2FA đã được bật.',
            'qr' => $request->user()->twoFactorQrCodeSvg(),
            'recovery_codes' => $request->user()->recoveryCodes(),
        ]);
    }
}
