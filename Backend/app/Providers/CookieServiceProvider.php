<?php

namespace App\Providers;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\ServiceProvider;

class CookieServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Can thiệp vào config ngay tại thời điểm chạy (runtime).
        // Đây là cách làm rất mạnh mẽ để đảm bảo giá trị đúng được sử dụng,
        // bất chấp mọi thứ khác. Chúng ta không kiểm tra môi trường,
        // chúng ta ÉP nó phải là 'false' cho TẤT CẢ các request.
        if (config('app.env') !== 'production') {
            Config::set('session.secure', false);
            Config::set('session.same_site', 'lax'); // Có thể đặt là lax để an toàn hơn none
        }
    }
}
