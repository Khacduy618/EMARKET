#!/bin/sh
set -e

# Lấy vai trò (role) từ biến môi trường ROLE, nếu không có thì mặc định là 'app'
role=${ROLE:-app}


# Chạy các lệnh chung cho tất cả các vai trò
echo "Running common setup tasks..."
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
echo "Common setup tasks complete."

# Lựa chọn hành động dựa trên vai trò
if [ "$role" = "app" ]; then
    # Vai trò 'app': Chạy PHP-FPM để phục vụ web request
    echo "Starting PHP-FPM for role: app"
    exec php-fpm

elif [ "$role" = "queue" ]; then
    # Vai trò 'queue': Chạy queue worker
    echo "Starting Queue Worker for role: queue"
    exec php artisan queue:work --verbose --tries=3 --timeout=90
    
elif [ "$role" = "scheduler" ]; then
    # Vai trò 'scheduler': Chạy cron daemon
    echo "Starting Cron Daemon for role: scheduler"
    # Cấp quyền cho file crontab (nó sẽ được mount vào từ docker-compose)
    chmod 0644 /etc/cron.d/laravel-cron
    # Chạy cron daemon ở foreground
    exec crond -f -L /dev/stdout

else
    echo "Error: Unknown role '$role'"
    exit 1
fi