<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\UpdatesUserProfileInformation;

class UpdateUserProfileInformation implements UpdatesUserProfileInformation
{
    /**
     * Validate and update the given user's profile information.
     */
    public function update(User $user, array $input): void
    {
        // Tạo rules tùy theo trường nào được gửi
        $rules = [];

        if (array_key_exists('Username', $input)) {
            $rules['Username'] = ['string', 'max:255', Rule::unique('Users', 'Username')->ignore($user->UserID, 'UserID')];
        }

        if (array_key_exists('Email', $input)) {
            $rules['Email'] = ['string', 'email', 'max:255', Rule::unique('Users', 'Email')->ignore($user->UserID, 'UserID')];
        }

        if (array_key_exists('FullName', $input)) {
            $rules['FullName'] = ['nullable', 'string', 'max:255'];
        }

        if (array_key_exists('Phone', $input)) {
            $rules['Phone'] = ['nullable', 'string', 'max:20'];
        }

        if (array_key_exists('Level', $input)) {
            $rules['Level'] = [Rule::in(User::LEVELS)];
        }

        if (array_key_exists('Role', $input)) {
            $rules['Role'] = [Rule::in(User::ROLES)];
        }

        if (array_key_exists('IsActive', $input)) {
            $rules['IsActive'] = ['boolean'];
        }

        // Validate
        Validator::make($input, $rules)->validateWithBag('updateProfileInformation');

        // Nếu email thay đổi và user cần xác minh lại
        if (
            array_key_exists('Email', $input) &&
            $input['Email'] !== $user->Email &&
            $user instanceof MustVerifyEmail
        ) {
            $this->updateVerifiedUser($user, $input);
        } else {
            $user->forceFill($input)->save();
        }
    }

    /**
     * Xử lý khi email bị thay đổi, cần reset xác minh email
     */
    protected function updateVerifiedUser(User $user, array $input): void
    {
        $input['email_verified_at'] = null;

        $user->forceFill($input)->save();

        $user->sendEmailVerificationNotification();
    }
}
