# backend/Dockerfile

# --- STAGE 1: Composer ---
FROM composer:2.7 AS composer

# --- STAGE 2: PHP Base Image ---
FROM php:8.3-fpm-alpine AS base
RUN apk add --no-cache bash git curl openssl libzip-dev zip unzip libpng-dev jpeg-dev freetype-dev icu-dev oniguruma-dev libxml2-dev
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd pdo_mysql zip bcmath intl exif opcache pcntl soap
COPY --from=composer /usr/bin/composer /usr/local/bin/composer
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
RUN composer dump-autoload --optimize
# RUN php artisan optimize:clear # Chạy các lệnh này lúc khởi động container sẽ linh hoạt hơn
# RUN php artisan config:cache
# RUN php artisan route:cache
# RUN php artisan view:cache
RUN chown -R www:www /var/www/html/storage /var/www/html/bootstrap/cache && \
    chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache
EXPOSE 9000
CMD ["php-fpm"]