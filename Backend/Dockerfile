

# --- STAGE 1: Composer ---
FROM composer:2.7 AS composer

# --- STAGE 2: PHP Base Image ---
FROM php:8.3-fpm-alpine AS base
RUN apk add --no-cache bash git curl openssl libzip-dev zip unzip libpng-dev jpeg-dev freetype-dev icu-dev oniguruma-dev libxml2-dev dcron
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd pdo_mysql zip bcmath intl exif opcache pcntl soap
COPY --from=composer /usr/bin/composer /usr/local/bin/composer

COPY cacert.pem /usr/local/share/ca-certificates/cacert.crt
RUN update-ca-certificates

# --- SỬA LỖI PHP-FPM ---
# Sửa file config mặc định để lắng nghe trên port 9000 thay vì socket
RUN sed -i 's/listen = \/var\/run\/php-fpm.sock/listen = 9000/' /usr/local/etc/php-fpm.d/www.conf.default

RUN addgroup -g 1000 -S www && adduser -u 1000 -S www -G www
WORKDIR /var/www/html
USER www

# --- STAGE 3: Build Dependencies ---
FROM base AS vendor
COPY --chown=www:www composer.json composer.lock ./
RUN composer install --no-interaction --no-scripts --no-progress --prefer-dist --optimize-autoloader --no-dev
RUN composer clear-cache

# --- STAGE 4: Production Image ---
FROM base AS production
COPY --from=vendor /var/www/html/vendor ./vendor
COPY --chown=www:www . .

# 1. Tạo file .env tạm thời, an toàn để build
RUN \
    # 1. Tạo file .env với một APP_KEY tĩnh và an toàn
    # Key này chỉ dùng để build, không phải key production thật
    echo "APP_ENV=production" > .env && \
    echo "APP_KEY=base64:b59hrBAP20zTw01R+So+KY/3jGFlYgM8tNDIDTjC38g=" >> .env && \
    echo "DB_CONNECTION=mysql" >> .env && \
    echo "CACHE_DRIVER=file" >> .env && \
    echo "SESSION_DRIVER=file" >> .env 

# 2. Chạy các lệnh tối ưu hóa ngay trong quá trình build
RUN composer dump-autoload --optimize

# 3. Sao chép Entrypoint Script và cấp quyền thực thi
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY php.ini /usr/local/etc/php/php.ini

USER root
RUN chmod +x /usr/local/bin/entrypoint.sh
USER www

# 4. Đặt lại quyền truy cập cho thư mục storage và bootstrap/cache
RUN chown -R www:www /var/www/html/storage /var/www/html/bootstrap/cache

# Khai báo port, entrypoint, và lệnh khởi động
EXPOSE 9000
ENTRYPOINT ["entrypoint.sh"]
CMD ["php-fpm"]
