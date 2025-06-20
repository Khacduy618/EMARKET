<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyInternalSecret
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $requestSecret = $request->header('X-Internal-Secret'); // Lấy giá trị từ header
        $configuredSecret = config('app.internal_api_secret_key'); // Lấy từ config (sẽ thiết lập ở bước sau)

        if (empty($requestSecret) || empty($configuredSecret) || !hash_equals((string)$configuredSecret, (string)$requestSecret)) {
            // Ghi log nếu muốn debug
            \Illuminate\Support\Facades\Log::warning('VerifyInternalSecret: Forbidden access attempt.', [
                'ip' => $request->ip(),
                'path' => $request->path(),
                'header_sent' => $requestSecret ? substr($requestSecret, 0, 5) . '...' : 'MISSING'
            ]);
            return response()->json(['message' => 'Forbidden: Invalid or missing internal secret.'], 403);
        }

        return $next($request);
    }
}