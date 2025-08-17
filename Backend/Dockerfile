# Sử dụng image PHP chính thức với FPM (ví dụ PHP 8.2)
FROM php:8.3-fpm-alpine

# 1. Cài đặt các dependencies hệ thống
RUN apk add --no-cache \
    curl \
    libzip-dev \
    zip \
    unzip \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    icu-dev \
    oniguruma-dev \
    libxml2-dev \
    git
# Không có supervisor và nginx ở đây nữa vì chúng là service riêng

# 2. Cài đặt các PHP extensions cần thiết cho Laravel
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    gd \
    pdo_mysql \
    zip \
    bcmath \
    intl \
    exif \
    opcache \
    pcntl

# 3. Cài đặt Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Thiết lập thư mục làm việc
WORKDIR /var/www/html
COPY cacert.pem /usr/local/etc/php/cacert.pem

# 2. Tìm đường dẫn file php.ini và thêm cấu hình vào đó
# Chạy `php --ini` để xem đường dẫn file php.ini được load, ví dụ: /usr/local/etc/php/php.ini
# Sau đó thêm cấu hình vào file đó.
RUN echo 'curl.cainfo="/usr/local/etc/php/cacert.pem"' >> /usr/local/etc/php/php.ini && \
    echo 'openssl.cafile="/usr/local/etc/php/cacert.pem"' >> /usr/local/etc/php/php.ini

# Sao chép file composer và toàn bộ source code của backend trước
COPY composer.json composer.lock ./
COPY . .

# Cài đặt dependencies của Laravel
RUN composer install --no-interaction --prefer-dist --optimize-autoloader
# Nếu cho development, bạn có thể bỏ --prefer-dist --optimize-autoloader
# và giữ lại --no-dev nếu bạn muốn (hoặc bỏ --no-dev để cài cả dev dependencies)

# Thiết lập quyền cho storage và bootstrap/cache
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Expose port 9000 cho PHP-FPM (Nginx sẽ kết nối vào port này)
EXPOSE 9000

# EXPOSE 9000 # Vẫn có thể giữ nếu bạn muốn FPM chạy song song hoặc có cách khác để start FPM
# CMD ["php-fpm"] # Bỏ CMD chạy FPM
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]