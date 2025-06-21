<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Auth\Events\Verified;


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
}
