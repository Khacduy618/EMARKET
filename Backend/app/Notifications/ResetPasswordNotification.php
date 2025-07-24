<?php
// app/Notifications/ResetPasswordNotification.php

namespace App\Notifications;

use App\Mail\ResetPasswordMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;
    public $token;

    public function __construct($token)
    {
        $this->token = $token;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     * Sửa lại hàm này
     */
    public function toMail($notifiable)
    {
        // Chỉ cần tạo và trả về Mailable.
        // Mọi logic khác sẽ nằm trong Mailable.
        return new ResetPasswordMail($this->token, $notifiable);
    }
}
