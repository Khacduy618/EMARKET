<?php

// use Illuminate\Foundation\Application;
// use Illuminate\Foundation\Configuration\Exceptions;
// use Illuminate\Foundation\Configuration\Middleware;
//
// return Application::configure(basePath: dirname(__DIR__))
//     ->withRouting(
//         web: __DIR__ . '/../routes/web.php',
//         api: __DIR__ . '/../routes/api.php',
//         commands: __DIR__ . '/../routes/console.php',
//         health: '/up',
//     )
//     ->withMiddleware(function (Middleware $middleware) {
//         // Sử dụng HandleCors của chính Laravel 11, không phải Fruitcake. Đây là mặc định và đúng.
//         $middleware->prepend(\Illuminate\Http\Middleware\HandleCors::class);
//
//         // Áp dụng middleware của Sanctum cho các route API.
//         $middleware->appendToGroup('api', [
//             \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
//         ]);
//
//         // Định nghĩa các alias.
//         $middleware->alias([
//             'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
//         ]);
//     })
//     ->withMiddleware(function (Middleware $middleware) { // << XÓA HOẶC COMMENT KHỐI NÀY
//         $middleware->validateCsrfTokens(
//             except: ['api/*']
//         );
//     })
//     ->withExceptions(function (Exceptions $exceptions) {
//         //
//     })->create();


use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) { // << XÓA HOẶC COMMENT KHỐI NÀY
            $middleware->prepend(\Illuminate\Http\Middleware\HandleCors::class);

        $middleware->validateCsrfTokens(
            except: ['api/*']
        );
        
        
         $middleware->redirectGuestsTo(function (Request $request) {
            // Nếu request muốn nhận JSON (tức là một API call từ frontend)
            if ($request->expectsJson()) {
                // thì không chuyển hướng, trả về null để middleware tự động
                // ném một AuthenticationException, sau đó sẽ được chuyển thành 
                // response JSON 401 Unauthenticated.
                return null;
            }

            // Đối với các request web thông thường (nếu có), bạn có thể
            // trả về URL frontend của bạn.
            return config('app.frontend_url') . '/login';
        });
        
    })
    ->withMiddleware(function (Middleware $middleware) {
    $middleware->trustProxies(at: '*');
       $middleware->api(prepend: [
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    ]);
        $middleware->alias([
            'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'seller' => \App\Http\Middleware\EnsureIsSeller::class,
            'auth.socketserver' => \App\Http\Middleware\VerifyInternalSecret::class
        //
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();