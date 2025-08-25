<?php
// app/Http/Controllers/Admin/UserController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Hash;
use Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Hiển thị danh sách người dùng với tìm kiếm, lọc và phân trang.
     */
    public function index(Request $request)
    {
        $query = User::query();

        // 1. Tìm kiếm (search)
        if ($request->has('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('Username', 'like', "%{$searchTerm}%")
                    ->orWhere('FullName', 'like', "%{$searchTerm}%")
                    ->orWhere('Email', 'like', "%{$searchTerm}%");
            });
        }

        // 2. Lọc theo vai trò (Role)
        if ($request->has('role') && $request->input('role') != '') {
            $query->where('Role', $request->input('role'));
        }

        // 3. Lọc theo trạng thái (Status)
        if ($request->has('status') && $request->input('status') != '') {
            $status = $request->input('status') === 'active' ? 1 : 0;
            $query->where('IsActive', $status);
        }

        // 4. Sắp xếp và Phân trang
        $users = $query->orderBy('UserID', 'desc')->paginate(15); // Mỗi trang 15 người dùng

        return response()->json($users);
    }

    /**
     * Tạo một người dùng mới.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'FullName' => ['required', 'string', 'max:255'],
            'Username' => ['required', 'string', 'max:255', 'unique:Users,Username'],
            'Email'    => ['required', 'string', 'email', 'max:255', 'unique:Users,Email'],
            'Password' => ['required', 'string', Password::min(8)->mixedCase(), 'confirmed'],
            'Phone'    => ['nullable', 'string', 'max:12'],
            'Role'     => ['required', Rule::in(User::ROLES)],
            'IsActive' => ['required', 'boolean'],
        ]);

        $validated['Password'] = Hash::make($validated['Password']);
        $user = User::create($validated);

        return response()->json($user, 201);
    }

    // show() có thể không cần thiết nếu bạn không có trang chi tiết riêng
    public function show(User $user)
    {
        return response()->json($user);
    }

    /**
     * Cập nhật thông tin người dùng.
     */
    public function update(Request $request, User $user)
    {
        // Ngăn admin tự sửa mình...
        if ($request->user()->UserID === $user->UserID) {
            return response()->json(['message' => 'Bạn không thể chỉnh sửa thông tin của chính mình tại đây.'], 403);
        }

        $validated = $request->validate([
            'FullName' => ['required', 'string', 'max:255'],
            'Username' => ['required', 'string', 'max:255', Rule::unique('Users', 'Username')->ignore($user->UserID, 'UserID')],
            'Email'    => ['required', 'string', 'email', 'max:255', Rule::unique('Users', 'Email')->ignore($user->UserID, 'UserID')],
            'Phone'    => ['nullable', 'string', 'max:12'],
            'Role'     => ['required', Rule::in(User::ROLES)],

            // --- SỬA ĐỔI QUAN TRỌNG ---
            // Biến IsActive giờ không bắt buộc (không có 'required')
            'IsActive' => ['nullable', 'boolean'],
        ]);

        // Mật khẩu chỉ được cập nhật nếu được cung cấp
        if ($request->filled('Password')) {
            $request->validate(['Password' => ['string', Password::min(8), 'confirmed']]);
            $validated['Password'] = Hash::make($request->input('Password'));
        }

        $validated['IsActive'] = $request->has('IsActive') ? $request->boolean('IsActive') : $user->IsActive;


        $user->update($validated);

        return response()->json($user);
    }

    /**
     * "Xóa" một người dùng.
     * Sẽ xóa vĩnh viễn nếu không có dữ liệu liên quan.
     * Sẽ vô hiệu hóa nếu có dữ liệu liên quan (đơn hàng, shop).
     */
    public function destroy(Request $request, User $user)
    {
        // Ngăn Admin tự xóa/vô hiệu hóa chính mình
        if ($request->user()->UserID === $user->UserID) {
            return response()->json(['message' => 'Bạn không thể thực hiện hành động này trên tài khoản của chính mình.'], 403);
        }

        // --- LOGIC MỚI: KIỂM TRA DỮ LIỆU LIÊN QUAN ---
        // Sử dụng `exists()` cho hiệu suất tốt nhất
        $hasRelatedData = $user->orders()->exists() || $user->shops()->exists();

        if ($hasRelatedData) {
            // Trường hợp 1: Người dùng có dữ liệu -> Chỉ vô hiệu hóa
            $user->IsActive = false;
            $user->save();

            // Trả về một message rõ ràng
            return response()->json([
                'message' => 'Người dùng có dữ liệu liên quan (đơn hàng/shop), tài khoản đã được vô hiệu hóa thay vì xóa.',
                'action' => 'deactivated'
            ]);
        } else {
            // Trường hợp 2: Người dùng "sạch" -> Xóa vĩnh viễn
            $user->delete();

            // Trả về response chuẩn cho việc xóa thành công
            return response()->noContent();
        }
    }

    /**
     * Cập nhật trạng thái kích hoạt/vô hiệu hóa của người dùng.
     */
    public function updateStatus(Request $request, User $user)
    {
        $validated = $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $user->IsActive = $validated['is_active'];
        $user->save();

        return response()->json($user);
    }

    /**
     * Tắt Xác thực Hai Yếu tố cho một người dùng cụ thể.
     */
    public function disableTwoFactorForUser(Request $request, User $user, TwoFactorAuthenticationProvider $provider)
    {
        // Ngăn Admin tự tắt 2FA của chính mình qua đây (nên vào trang security)
        if ($request->user()->UserID === $user->UserID) {
            return response()->json(['message' => 'Bạn nên quản lý 2FA của mình trong trang Bảo mật.'], 403);
        }

        // Tắt 2FA bằng cách xóa secret và confirmed_at
        $user->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null, // Quan trọng
        ])->save();

        return response()->json(['message' => 'Đã tắt 2FA cho người dùng.']);
    }


    /**
     * Cập nhật trạng thái hàng loạt cho nhiều người dùng.
     */
    public function bulkUpdateStatus(Request $request)
    {
        $validated = $request->validate([
            'userIds' => 'required|array',
            'userIds.*' => 'integer|exists:Users,UserID',
            'status' => 'required|boolean',
        ]);

        // Ngăn Admin tự vô hiệu hóa chính mình trong danh sách
        $safeUserIds = collect($validated['userIds'])->reject(function ($userId) {
            return $userId == Auth::id();
        });

        User::whereIn('UserID', $safeUserIds)->update(['IsActive' => $validated['status']]);

        return response()->json(['message' => 'Cập nhật trạng thái hàng loạt thành công.']);
    }

    /**
     * "Xóa mềm" hoặc xóa vĩnh viễn nhiều người dùng.
     */
    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'userIds' => 'required|array',
            'userIds.*' => 'integer|exists:Users,UserID',
        ]);

        $safeUserIds = collect($validated['userIds'])->reject(function ($userId) {
            return $userId == Auth::id();
        });

        $deactivatedCount = 0;
        $deletedCount = 0;

        $users = User::whereIn('UserID', $safeUserIds)->get();

        foreach ($users as $user) {
            if ($user->orders()->exists() || $user->shops()->exists()) {
                // Nếu có dữ liệu, chỉ vô hiệu hóa
                $user->IsActive = false;
                $user->save();
                $deactivatedCount++;
            } else {
                // Nếu không, xóa vĩnh viễn
                $user->delete();
                $deletedCount++;
            }
        }

        return response()->json([
            'message' => "Hành động hoàn tất. {$deactivatedCount} tài khoản đã được vô hiệu hóa, {$deletedCount} tài khoản đã được xóa vĩnh viễn.",
        ]);
    }

    /**
     * Tắt 2FA hàng loạt cho danh sách người dùng.
     */
    public function bulkDisableTwoFactor(Request $request)
    {
        $validated = $request->validate([
            'userIds' => 'required|array',
            'userIds.*' => 'integer|exists:Users,UserID',
        ]);

        $safeUserIds = collect($validated['userIds'])->reject(function ($userId) {
            return $userId == Auth::id();
        });

        // Tìm tất cả user hợp lệ và cập nhật
        $users = User::whereIn('UserID', $safeUserIds)->get();

        foreach ($users as $user) {
            $user->forceFill([
                'two_factor_secret' => null,
                'two_factor_recovery_codes' => null,
                'two_factor_confirmed_at' => null,
            ])->save();
        }

        return response()->json(['message' => 'Đã tắt 2FA cho các tài khoản đã chọn.']);
    }

    /**
     * Cập nhật vai trò hàng loạt cho nhiều người dùng.
     */
    public function bulkUpdateRole(Request $request)
    {
        $validated = $request->validate([
            'userIds' => 'required|array',
            'userIds.*' => 'integer|exists:Users,UserID',
            // Sử dụng Rule::in để đảm bảo vai trò hợp lệ
            'role' => ['required', Rule::in(User::ROLES)],
        ]);

        // Ngăn Admin tự thay đổi vai trò của chính mình
        $safeUserIds = collect($validated['userIds'])->reject(function ($userId) {
            return $userId == Auth::id();
        });

        if ($safeUserIds->isEmpty() && count($validated['userIds']) > 0) {
            return response()->json(['message' => 'Hành động không được phép trên tài khoản của chính bạn.'], 403);
        }

        User::whereIn('UserID', $safeUserIds)->update(['Role' => $validated['role']]);

        return response()->json(['message' => 'Cập nhật vai trò hàng loạt thành công.']);
    }




}
