<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LogoutResponse as LogoutResponseContract;
use Illuminate\Http\JsonResponse;

class CustomLogoutResponse implements LogoutResponseContract
{
    public function toResponse($request): JsonResponse
    {
        return response()->json(null, 204); // trả về empty body, status 204 No Content
    }
}
