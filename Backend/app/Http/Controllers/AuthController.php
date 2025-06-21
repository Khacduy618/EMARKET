<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;


class AuthController extends Controller
{
    public function verifyEmail(Request $request)
    {
        $user = User::findOrFail($request->route('id'));

        if (! hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Link không hợp lệ.'], 403);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email đã được xác minh.'], 200);
        }

        $user->markEmailAsVerified();
        event(new Verified($user));

        return response()->json(['message' => 'Xác minh email thành công. Bây giờ bạn có thể đăng nhập.'], 200);
    }

    public function loginRedirect()
    {
        return response()->json([
            'message' => 'Redirect login placeholder.',
        ]);
    }

    public function resendVerificationEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('Email', $request->email)->first();

        // Nếu không tìm thấy user
        if (! $user) {
            return response()->json([
                'message' => 'Nếu email tồn tại, link xác minh đã được gửi.',
            ], 200);
        }

        // Nếu đã xác minh rồi
        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email đã được xác minh.',
            ], 200);
        }

        // Gửi lại email xác minh
        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Link xác minh đã được gửi lại.',
        ], 200);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Tìm user theo email
        $user = User::where('Email', $request->email)->first();

        // Kiểm tra thông tin đăng nhập
        if (! $user || ! Hash::check($request->password, $user->Password)) {
            throw ValidationException::withMessages([
                'email' => ['Thông tin đăng nhập không chính xác.'],
            ]);
        }

        // Kiểm tra email đã xác minh
        if (! $user->hasVerifiedEmail()) {
            throw ValidationException::withMessages([
                'email' => ['Bạn cần xác minh email trước khi đăng nhập.'],
            ]);
        }

        // Kiểm tra tài khoản có active không
        if (! $user->IsActive) {
            throw ValidationException::withMessages([
                'email' => ['Tài khoản của bạn đã bị vô hiệu hoá.'],
            ]);
        }

        // Đăng nhập người dùng (session-based nếu cần)
        Auth::login($user);

        // Tạo token cho API
        $token = $user->createToken('auth_token')->plainTextToken;

        // Trả về token và thông tin user
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }
}
