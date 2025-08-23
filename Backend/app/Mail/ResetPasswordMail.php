<?php
// app/Mail/ResetPasswordMail.php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ResetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public $token;
    public $notifiable; // Nhận toàn bộ object User

    // Dữ liệu sẽ được truyền vào view
    public $url;
    public $count;

    /**
     * Create a new message instance.
     */
    public function __construct($token, $notifiable)
    {
        $this->token = $token;
        $this->notifiable = $notifiable;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        // --- LOGIC XỬ LÝ NẰM HẾT Ở ĐÂY ---

        // 1. Lấy địa chỉ email người nhận.
        // Nếu dòng này gây lỗi, nghĩa là model User của bạn không có hàm getEmailForPasswordReset().
        $recipientEmail = $this->notifiable->getEmailForPasswordReset();

        // 2. Tạo URL đầy đủ
        $frontendUrl = config('app.frontend_url', 'https://minhweb.click');
        $this->url = $frontendUrl . '/reset-password?token=' . $this->token . '&email=' . urlencode($recipientEmail);

        // 3. Lấy thời gian hết hạn
        $this->count = 60; // Dùng giá trị cố định, an toàn

        // 4. Kiểm tra xem có email người nhận không TRƯỚC KHI gửi
        if (empty($recipientEmail)) {
             // Ghi log lỗi chi tiết để chúng ta biết
            Log::error('Attempted to send password reset email without a recipient.', [
                'user_id' => $this->notifiable->id ?? 'unknown'
            ]);
            // Ném lỗi để dừng việc gửi mail
            throw new \Exception('No recipient address provided for the password reset email.');
        }

        // 5. Xây dựng và trả về email
        return $this->to($recipientEmail) // <<-- Đặt người nhận một cách tường minh
                    ->subject('Yêu cầu đặt lại mật khẩu - EMARKET')
                    ->view('emails.reset_password')
                    ->with([
                        // Truyền các biến public vào view
                        'url' => $this->url,
                        'notifiable' => $this->notifiable,
                        'count' => $this->count,
                    ]);
    }
}
