<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;


class AuthController extends Controller
{
    /**
     * Đánh dấu email của người dùng là đã xác thực và chuyển hướng về frontend.
     */
    public function verifyEmail(Request $request)
    {
        // Lấy URL của frontend từ file .env
        $frontendUrl = 'http://localhost';

        $user = User::findOrFail($request->route('id'));

        // Kiểm tra hash
        if (! hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
            // Chuyển hướng đến trang lỗi của frontend
            $redirectUrl = $frontendUrl . '/verify-error?message=' . urlencode('Liên kết xác thực không hợp lệ.');
            return redirect()->away($redirectUrl);
        }

        // Kiểm tra xem đã xác thực từ trước chưa
        if ($user->hasVerifiedEmail()) {
            // Chuyển hướng đến trang thành công của frontend (nhưng có thể thông báo khác)
            $redirectUrl = $frontendUrl . '/verify-success?message=' . urlencode('Tài khoản của bạn đã được kích hoạt từ trước.');
            return redirect()->away($redirectUrl);
        }

        // Đánh dấu đã xác thực và kích hoạt sự kiện
        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        // Chuyển hướng đến trang thành công của frontend
        $redirectUrl = $frontendUrl . '/verify-success?message=' . urlencode('Kích hoạt tài khoản thành công! Bây giờ bạn có thể đăng nhập.');
        return redirect()->away($redirectUrl);
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

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->Password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Mật khẩu hiện tại không chính xác.'],
            ]);
        }

        $user->update([
            'Password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Cập nhật mật khẩu thành công.',
        ]);
    }

    /**
     * Kiểm tra xem một số điện thoại đã tồn tại trong database hay chưa.
     */
    public function checkPhone(Request $request)
    {
        $validated = $request->validate([
            'Phone' => 'required|string|max:12',
        ]);

        $isAvailable = !User::where('Phone', $validated['Phone'])->exists();

        return response()->json(['isAvailable' => $isAvailable]);
    }

    public function checkUsername(Request $request)
    {
        $validated = $request->validate(['Username' => 'required|string']);
        $isAvailable = !User::where('Username', $validated['Username'])->exists();
        return response()->json(['isAvailable' => $isAvailable]);
    }

    public function checkEmail(Request $request)
    {
        $validated = $request->validate(['Email' => 'required|email']);
        $isAvailable = !User::where('Email', $validated['Email'])->exists();
        return response()->json(['isAvailable' => $isAvailable]);
    }
}
