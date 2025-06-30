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
use Illuminate\Support\Facades\Log;

use Laravel\Fortify\Contracts\{
    LoginResponse,
    EmailVerificationNotificationSentResponse as EmailVerificationNotificationResponseContract,
    RegisterResponse,
    SuccessfulPasswordResetLinkRequestResponse,
    PasswordResetResponse,
    PasswordUpdateResponse,
    PasswordConfirmedResponse,
    TwoFactorEnabledResponse,
    TwoFactorLoginResponse,
    LogoutResponse,
    VerifyEmailResponse,
    RecoveryCodesGeneratedResponse,
    TwoFactorDisabledResponse,
    TwoFactorConfirmedResponse,
    ProfileInformationUpdatedResponse
};

use App\Http\Responses\{
    CustomLoginResponse,
    CustomEmailVerificationNotificationResponse,
    CustomRegisterResponse,
    CustomPasswordResetLinkResponse,
    CustomPasswordResetResponse,
    CustomPasswordUpdateResponse,
    CustomPasswordConfirmedResponse,
    CustomTwoFactorEnabledResponse,
    CustomTwoFactorLoginResponse,
    CustomLogoutResponse,
    CustomVerifyEmailResponse,
    CustomRecoveryCodesGeneratedResponse,
    CustomTwoFactorDisabledResponse,
    CustomTwoFactorConfirmedResponse,
    CustomProfileInformationUpdatedResponse
};

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
        $this->app->singleton(
            LogoutResponse::class,
            CustomLogoutResponse::class
        );
        $this->app->singleton(
            VerifyEmailResponse::class,
            CustomVerifyEmailResponse::class
        );
        $this->app->singleton(
            RecoveryCodesGeneratedResponse::class,
            CustomRecoveryCodesGeneratedResponse::class
        );
        $this->app->singleton(
            TwoFactorDisabledResponse::class,
            CustomTwoFactorDisabledResponse::class
        );
        $this->app->singleton(
            TwoFactorConfirmedResponse::class,
            CustomTwoFactorConfirmedResponse::class
        );
        $this->app->singleton(
            ProfileInformationUpdatedResponse::class,
            CustomProfileInformationUpdatedResponse::class
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
        Fortify::resetPasswordView(function ($request) {
            // ---- BẮT ĐẦU GHI LOG ----
            Log::info('--- Fortify::resetPasswordView RUNNING ---');

            $token = $request->route('token');
            Log::info('Token from route: ' . $token);

            $email = $request->input('email');
            Log::info('Email from request input: ' . $email);

            // Log toàn bộ request để xem có gì bất thường không
            Log::info('Full request query: ', $request->query());

            if (empty($token) || empty($email)) {
                Log::error('Token hoặc Email bị rỗng. Không thể tạo redirect URL.');
            }

            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
            Log::info('Frontend URL from config: ' . $frontendUrl);

            $redirectUrl = $frontendUrl . '/reset-password?token=' . $token . '&email=' . urlencode($email);
            Log::info('Final redirect URL to be sent: ' . $redirectUrl);
            Log::info('--- END Fortify::resetPasswordView ---');
            // ---- KẾT THÚC GHI LOG ----

            return redirect()->away($redirectUrl);
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(1)->by($throttleKey);
        });

        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(1)->by($request->session()->get('login.id'));
        });
    }
}
