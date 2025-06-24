<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\LoginCheckEmail;
use App\Actions\Fortify\ResetUserPassword;
use App\Actions\Fortify\UpdateUserPassword;
use App\Actions\Fortify\UpdateUserProfileInformation;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Laravel\Fortify\Fortify;

use Laravel\Fortify\Contracts\LoginResponse;
use App\Http\Responses\CustomLoginResponse;
use Laravel\Fortify\Contracts\EmailVerificationNotificationSentResponse as EmailVerificationNotificationResponseContract;
use App\Http\Responses\CustomEmailVerificationNotificationResponse;
use Laravel\Fortify\Contracts\RegisterResponse;
use App\Http\Responses\CustomRegisterResponse;
use Laravel\Fortify\Contracts\SuccessfulPasswordResetLinkRequestResponse;
use App\Http\Responses\CustomPasswordResetLinkResponse;
use Laravel\Fortify\Contracts\PasswordResetResponse;
use App\Http\Responses\CustomPasswordResetResponse;
use Laravel\Fortify\Contracts\PasswordUpdateResponse;
use App\Http\Responses\CustomPasswordUpdateResponse;
use Laravel\Fortify\Contracts\PasswordConfirmedResponse;
use App\Http\Responses\CustomPasswordConfirmedResponse;
use Laravel\Fortify\Contracts\TwoFactorEnabledResponse;
use App\Http\Responses\CustomTwoFactorEnabledResponse;
use Laravel\Fortify\Contracts\TwoFactorLoginResponse;
use App\Http\Responses\CustomTwoFactorLoginResponse;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(LoginResponse::class, CustomLoginResponse::class);
        $this->app->singleton(
            EmailVerificationNotificationResponseContract::class,
            CustomEmailVerificationNotificationResponse::class
        );
        $this->app->singleton(RegisterResponse::class, CustomRegisterResponse::class);
        $this->app->singleton(
            SuccessfulPasswordResetLinkRequestResponse::class,
            CustomPasswordResetLinkResponse::class
        );
        $this->app->singleton(
            PasswordResetResponse::class,
            CustomPasswordResetResponse::class
        );
        $this->app->singleton(
            PasswordUpdateResponse::class,
            CustomPasswordUpdateResponse::class
        );
        $this->app->singleton(
            PasswordConfirmedResponse::class,
            CustomPasswordConfirmedResponse::class
        );
        $this->app->singleton(
            TwoFactorEnabledResponse::class,
            CustomTwoFactorEnabledResponse::class
        );
        $this->app->singleton(
            TwoFactorLoginResponse::class,
            CustomTwoFactorLoginResponse::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Fortify::authenticateUsing(new LoginCheckEmail);
        Fortify::createUsersUsing(CreateNewUser::class);
        Fortify::updateUserProfileInformationUsing(UpdateUserProfileInformation::class);
        Fortify::updateUserPasswordsUsing(UpdateUserPassword::class);
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });

        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });
    }
}
