<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Illuminate\Support\Facades\Auth;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'Username' => ['required', 'string', 'max:255', 'unique:Users,Username'],
            'Email'    => ['required', 'string', 'email', 'max:255', 'unique:Users,Email'],
            'Password' => $this->passwordRules(),
            'Password_confirmation' => ['required', 'string', 'same:Password'],
            'FullName' => ['nullable', 'string', 'max:255'],
            'Phone'    => ['nullable', 'string', 'max:20'],
            'Level'    => [Rule::in(User::LEVELS)],
            'Role'     => [Rule::in(User::ROLES)],
            'IsActive' => ['boolean'],
        ])->validate();

        // Hash mật khẩu
        $input['Password'] = Hash::make($input['Password']);

        $user = User::create([
            'Username' => $input['Username'],
            'Email'    => $input['Email'],
            'Password' => $input['Password'],
            'FullName' => $input['FullName'] ?? null,
            'Phone'    => $input['Phone'] ?? null,
            'Level'    => $input['Level'] ?? 'Đồng',
            'Role'     => $input['Role'] ?? 'Người mua',
            'IsActive' => $input['IsActive'] ?? true,
        ]);

        // 👉 Login ngay sau khi tạo (bắt buộc để gửi mail xác thực)
        Auth::login($user);

        // 👉 Gửi mail xác thực
        $user->sendEmailVerificationNotification();

        return $user;
    }

    // public function create(array $input): User
    // {
    //     Validator::make($input, [
    //         'name' => ['required', 'string', 'max:255'],
    //         'email' => [
    //             'required',
    //             'string',
    //             'email',
    //             'max:255',
    //             Rule::unique(User::class),
    //         ],
    //         'password' => $this->passwordRules(),
    //     ])->validate();
    //
    //     return User::create([
    //         'name' => $input['name'],
    //         'email' => $input['email'],
    //         'password' => Hash::make($input['password']),
    //     ]);
    // }
}
