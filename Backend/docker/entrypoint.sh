#!/bin/sh
set -e

# Di chuyển vào đúng thư mục làm việc
cd /var/www/html

# Chạy các lệnh tối ưu hóa của Laravel
# Nó sẽ đọc file .env được mount từ docker-compose
echo "Running Laravel optimizations..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link --force


echo "Starting PHP-FPM..."
# Lệnh cuối cùng để giữ container chạy
exec "$@"