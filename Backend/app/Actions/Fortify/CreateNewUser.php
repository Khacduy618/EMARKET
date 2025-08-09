<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

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

        return User::create([
            'Username' => $input['Username'],
            'Email'    => $input['Email'],
            'Password' => $input['Password'],
            'FullName' => $input['FullName'] ?? null,
            'Phone'    => $input['Phone'] ?? null,
            'Level'    => $input['Level'] ?? 'Đồng',
            'Role'     => $input['Role'] ?? 'Buyer',
            'IsActive' => $input['IsActive'] ?? true,
        ]);
    }
}
