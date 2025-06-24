<?php
namespace App\Http\Responses;

use Laravel\Fortify\Contracts\PasswordConfirmedResponse as Contract;
use Illuminate\Http\JsonResponse;

class CustomPasswordConfirmedResponse implements Contract
{
    public function toResponse($request): JsonResponse
    {
        return response()->json([
            'confirmed' => true,
            'request' => $request->all(),
        ]);
    }
}
