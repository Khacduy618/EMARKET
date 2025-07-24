<?php
namespace App\Http\Responses;

use Laravel\Fortify\Contracts\RecoveryCodesGeneratedResponse as Contract;
use Illuminate\Http\JsonResponse;

class CustomRecoveryCodesGeneratedResponse implements Contract
{
    public function toResponse($request): JsonResponse
    {
        return response()->json([
            'recovery_codes' => $request->user()->recoveryCodes(),
            'message' => 'Mã khôi phục 2FA đã được làm mới.',
        ]);
    }
}
