<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebhookService
{
    public function sendWebhook(array $payload)
    {
        // Giả định URL webhook của app giao hàng (có thể cấu hình trong .env hoặc database)
        $webhookUrl = env('INTERNAL_WEBHOOK_URL', 'http://nginx/api/webhook');

        $response = Http::post($webhookUrl, $payload);

        if ($response->failed()) {
            Log::error("Webhook failed for order {$payload['order_code']}: " . $response->status() . ' - ' . $response->body(), ['payload' => $payload]);
        } else {
            Log::info("Webhook sent successfully for order {$payload['order_code']}", ['status' => $response->status(), 'payload' => $payload]);
        }
    }
}