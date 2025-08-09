# Define composer stage
FROM docker.io/library/composer:latest AS composer

# Sử dụng image PHP chính thức với FPM (ví dụ PHP 8.2)
FROM php:8.3-fpm-alpine AS base

ENV TZ=Asia/Ho_Chi_Minh
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 1. Cài đặt các dependencies hệ thống cần thiết (đã bỏ linux-headers và các thứ cho xdebug build)
RUN apk add --no-cache \
    bash \
    git \
    curl \
    openssl \
    libzip-dev \
    zip \
    unzip \
    libpng-dev \
    jpeg-dev \
    freetype-dev \
    icu-dev \
    oniguruma-dev \
    libxml2-dev \
    # Không cần .build-deps cho $PHPIZE_DEPS nếu không cài extension bằng pecl hoặc không cần compile phức tạp
    # Chỉ cần các thư viện runtime cho các extension cài bằng docker-php-ext-install
    && apk add --virtual .phpize-deps $PHPIZE_DEPS \
    # XÓA CÁC LỆNH LIÊN QUAN ĐẾN XDEBUG
    # && pecl install xdebug \
    # && docker-php-ext-enable xdebug \
    && apk del .phpize-deps

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
    pcntl \
    soap

# 3. Cài đặt Composer
COPY --from=composer /usr/bin/composer /usr/local/bin/composer

# Thiết lập thư mục làm việc
WORKDIR /var/www/html

# Sao chép chỉ các file cần thiết cho việc cài đặt Composer dependencies
COPY composer.json composer.lock ./

# Cài đặt dependencies của Laravel
RUN composer install \
    --prefer-dist \
    --no-interaction \
    --no-scripts \
    --no-progress \
    --optimize-autoloader \
    --ignore-platform-reqs
    # Bỏ --no-dev nếu bạn đang build cho môi trường development và cần các dev packages
    # Nếu đây là image cho production, hãy thêm --no-dev

# Sao chép toàn bộ source code của ứng dụng Laravel vào thư mục làm việc
COPY . .

# Chạy các script của Composer
RUN composer dump-autoload --optimize

# *** PHẦN SỬA LỖI QUAN TRỌNG ***

# 1. Tạo symbolic link. Xóa link cũ nếu có để tránh lỗi.
# Lệnh này đảm bảo link được tạo bên trong image.
RUN rm -rf public/storage && php artisan storage:link

# 2. Thiết lập quyền sở hữu và quyền ghi cho thư mục storage và bootstrap/cache
# Điều này cực kỳ quan trọng để Nginx container (khi mount volume) có thể đọc được file.
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Lệnh để khởi động Laravel development server (Giữ nguyên như của bạn)
EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
