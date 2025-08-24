<?php
// File: app/Mail/SellerRefundConfirmationMail.php


namespace App\Mail;


use App\Models\ReturnRequest; // Quan trọng: import model ReturnRequest
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue; // Thêm ShouldQueue để gửi mail trong nền
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
// implements ShouldQueue
class SellerRefundConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;


    public $returnRequest;


    /**
     * Create a new message instance.
     *
     * @param \App\Models\ReturnRequest $returnRequest
     */
    public function __construct(ReturnRequest $returnRequest)
    {
        $this->returnRequest = $returnRequest;
    }


    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[Emarket] Thông báo hoàn tiền cho yêu cầu #' . $this->returnRequest->RequestCode,
        );
    }


    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        // Liên kết với file view chúng ta sẽ tạo ở bước tiếp theo
        return new Content(
            view: 'emails.seller_refund_confirmation',
        );
    }


    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}

