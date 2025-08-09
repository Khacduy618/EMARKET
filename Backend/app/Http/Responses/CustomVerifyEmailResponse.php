<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\VerifyEmailResponse as VerifyEmailResponseContract;
use Illuminate\Http\JsonResponse;

class CustomVerifyEmailResponse implements VerifyEmailResponseContract
{
    public function toResponse($request): JsonResponse
    {
        return response()->json([
            'message' => 'Email đã được xác minh.',
            'request' => $request->all(),
        ]);
    }
}
