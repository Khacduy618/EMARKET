<?php
namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Config;
use Illuminate\Notifications\Messages\MailMessage;

class VerifyEmail extends BaseVerifyEmail
{
    /**
     * Tạo link xác minh tùy chỉnh.
     */
    protected function verificationUrl($notifiable)
    {
        $appUrl = config('app.frontend_url', config('app.url')); // Nếu dùng với Next.js

        $temporarySignedURL = URL::temporarySignedRoute(
            'verification.verify',  // phải khớp route name
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );

        return $temporarySignedURL;

        // Nếu dùng Next.js frontend, trả về dạng:
        // return $appUrl . '/verify-email?url=' . urlencode($temporarySignedURL);
    }

    public function toMail($notifiable)
    {
        $url = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Xác minh địa chỉ email của bạn')
            ->markdown('emails.verify-email', ['url' => $url]);
    }
}
