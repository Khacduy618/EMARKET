<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class LoginCheckEmail
{
    public function __invoke($request)
    {
        $email = $request->input('email'); // lowercase
        $password = $request->input('password');

        $user = User::where('Email', $email)->first();

        if (! $user || ! Hash::check($password, $user->Password)) {
            throw ValidationException::withMessages([
                'email' => ['Thông tin đăng nhập không chính xác.'],
            ]);
        }

        if (! $user->hasVerifiedEmail()) {
            throw ValidationException::withMessages([
                'email' => ['Bạn cần xác minh email trước khi đăng nhập.'],
            ]);
        }

        if (! $user->IsActive) {
            throw ValidationException::withMessages([
                'email' => ['Tài khoản của bạn đã bị vô hiệu hoá.'],
            ]);
        }

        return $user;
    }
}
