<?php
namespace App\Http\Responses;

use Laravel\Fortify\Contracts\ProfileInformationUpdatedResponse as Contract;
use Illuminate\Http\JsonResponse;

class CustomProfileInformationUpdatedResponse implements Contract
{
    public function toResponse($request): JsonResponse
    {
        return response()->json([
            'message' => 'Thông tin cá nhân đã được cập nhật.',
            'user' => $request->user(),
        ]);
    }
}
