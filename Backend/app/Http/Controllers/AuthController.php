<?php


namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'FullName'     => 'required|string|max:255',
            'Email'    => 'required|string|email|max:255|unique:users',
            'Password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'FullName'     => $request->FullName,
            'Email'    => $request->Email,
            'Password' => bcrypt($request->Password),
        ]);

        return response()->json([
            'Token' => $user->createToken('api-token')->plainTextToken,
            'User'  => $user,
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'Email'    => 'required|email',
            'Password' => 'required',
        ]);

        $user = User::where('Email', $request->Email)->first();

        if (! $user || ! Hash::check($request->Password, $user->Password)) {
            throw ValidationException::withMessages([
                'Email' => ['Thông tin đăng nhập không chính xác.'],
            ]);
        }

        return response()->json([
            'Token' => $user->createToken('api-token')->plainTextToken,
            'User'  => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Đăng xuất thành công']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}