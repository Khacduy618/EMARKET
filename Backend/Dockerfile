# # Sử dụng image PHP chính thức với FPM (ví dụ PHP 8.2)
# FROM php:8.2-fpm-alpine

# # 1. Cài đặt các dependencies hệ thống
# RUN apk add --no-cache \
#     curl \
#     libzip-dev \
#     zip \
#     unzip \
#     libpng-dev \
#     libjpeg-turbo-dev \
#     freetype-dev \
#     icu-dev \
#     oniguruma-dev \
#     libxml2-dev \
#     git
# # Không có supervisor và nginx ở đây nữa vì chúng là service riêng

# # 2. Cài đặt các PHP extensions cần thiết cho Laravel
# RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
#     && docker-php-ext-install -j$(nproc) \
#     gd \
#     pdo_mysql \
#     zip \
#     bcmath \
#     intl \
#     exif \
#     opcache \
#     pcntl

# # 3. Cài đặt Composer
# RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# # Thiết lập thư mục làm việc
# WORKDIR /var/www/html

# # Sao chép file composer và toàn bộ source code của backend trước
# COPY composer.json composer.lock ./
# COPY . .

# # Cài đặt dependencies của Laravel
# RUN composer install --no-interaction --prefer-dist --optimize-autoloader
# # Nếu cho development, bạn có thể bỏ --prefer-dist --optimize-autoloader
# # và giữ lại --no-dev nếu bạn muốn (hoặc bỏ --no-dev để cài cả dev dependencies)

# # Thiết lập quyền cho storage và bootstrap/cache
# RUN chown -R www-data:www-data storage bootstrap/cache \
#     && chmod -R 775 storage bootstrap/cache

# # Expose port 9000 cho PHP-FPM (Nginx sẽ kết nối vào port này)
# EXPOSE 9000

# # EXPOSE 9000 # Vẫn có thể giữ nếu bạn muốn FPM chạy song song hoặc có cách khác để start FPM
# # CMD ["php-fpm"] # Bỏ CMD chạy FPM
# CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]


# Sử dụng image PHP chính thức với FPM (ví dụ PHP 8.2)
# Tuy nhiên, CMD của bạn đang là php artisan serve, nên image php:8.2-cli-alpine có thể gọn hơn
# Nhưng php:8.2-fpm-alpine vẫn chạy được artisan serve.


# FROM php:8.2-fpm-alpine

# # 1. Cài đặt các dependencies hệ thống
# RUN apk add --no-cache \
#     curl \
#     libzip-dev \
#     zip \
#     unzip \
#     libpng-dev \
#     jpeg-dev \
#     freetype-dev \
#     icu-dev \
#     oniguruma-dev \
#     libxml2-dev \
#     git \
#     bash # Thêm bash nếu script cần

# # 2. Cài đặt các PHP extensions cần thiết cho Laravel
# RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
#     && docker-php-ext-install -j$(nproc) \
#     gd \
#     pdo_mysql \
#     zip \
#     bcmath \
#     intl \
#     exif \
#     opcache \
#     pcntl \
#     soap # Một số project Laravel có thể cần

# # 3. Cài đặt Composer
# COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# # Thiết lập thư mục làm việc
# WORKDIR /var/www/html

# # Sao chép file composer và toàn bộ source code của backend trước
# COPY composer.json composer.lock ./
# # Cài đặt dependencies của Laravel (bỏ --no-dev cho môi trường dev)
# RUN composer install --no-interaction --prefer-dist --optimize-autoloader --ignore-platform-reqs

# COPY . .

# # Thiết lập quyền cho storage và bootstrap/cache
# # Chạy sau khi copy code để đảm bảo thư mục tồn tại
# RUN chown -R www-data:www-data storage bootstrap/cache \
#     && chmod -R 775 storage bootstrap/cache

# # Expose port 8000 cho php artisan serve
# EXPOSE 8000

# # Lệnh để chạy Laravel development server
# CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]


# Sử dụng image PHP chính thức với FPM (ví dụ PHP 8.2)
# FROM php:8.2-fpm-alpine

# # 1. Cài đặt các dependencies hệ thống
# RUN apk add --no-cache \
#     curl \
#     libzip-dev \
#     zip \
#     unzip \
#     libpng-dev \
#     jpeg-dev \
#     freetype-dev \
#     icu-dev \
#     oniguruma-dev \
#     libxml2-dev \
#     git \
#     bash

# # 2. Cài đặt các PHP extensions cần thiết cho Laravel
# RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
#     && docker-php-ext-install -j$(nproc) \
#     gd \
#     pdo_mysql \
#     zip \
#     bcmath \
#     intl \
#     exif \
#     opcache \
#     pcntl \
#     soap

# # 3. Cài đặt Composer
# COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# # Thiết lập thư mục làm việc
# WORKDIR /var/www/html

# # Sao chép toàn bộ source code của backend vào thư mục làm việc
# # Điều này đảm bảo file 'artisan' và mọi thứ khác đã có mặt
# COPY . .

# # Cài đặt dependencies của Laravel
# # Chạy với quyền của user www-data có thể giúp tránh một số vấn đề về quyền
# # USER www-data # Tạm thời bỏ qua để xem lỗi có phải do quyền không
# RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev --ignore-platform-reqs
# # Bỏ --no-dev nếu bạn cần dev dependencies trong image (thường thì không cho image fpm production)

# # Sau khi composer install, chạy lại lệnh clear và cache (nếu cần cho production)
# # RUN php artisan cache:clear
# # RUN php artisan config:cache
# # RUN php artisan route:cache
# # RUN php artisan view:cache

# # Thiết lập quyền cho storage và bootstrap/cache
# # Đảm bảo các thư mục này tồn tại trước khi chown/chmod
# RUN mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache storage/logs \
#     && mkdir -p bootstrap/cache \
#     && chown -R www-data:www-data storage bootstrap/cache \
#     && chmod -R ug+rwx storage bootstrap/cache
#     # Hoặc chmod -R 775 nếu cần thiết hơn, nhưng ug+rwx thường đủ cho www-data

# # Expose port 9000 cho PHP-FPM (Nginx sẽ kết nối vào port này)
# EXPOSE 9000

# # Lệnh để chạy Laravel development server (như bạn đang dùng)
# # Hoặc CMD ["php-fpm"] nếu Nginx được cấu hình để nói chuyện với PHP-FPM qua port 9000
# CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

# Sử dụng image PHP chính thức. Image -cli-alpine sẽ nhẹ hơn -fpm-alpine
# nếu bạn chỉ chạy artisan serve và không cần FPM.
# Tuy nhiên, -fpm-alpine vẫn hoạt động tốt.


# Sử dụng image PHP chính thức với FPM (ví dụ PHP 8.2)
FROM php:8.2-fpm-alpine AS base

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
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

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

# Chạy các script của Composer mà trước đó đã bỏ qua
RUN composer dump-autoload --optimize
# RUN php artisan storage:link # Quan trọng nếu bạn dùng storage link

# Thiết lập quyền sở hữu và quyền ghi
RUN mkdir -p storage/framework/sessions storage/framework/cache/data storage/framework/views storage/logs \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache storage/logs

# Expose port mà `php artisan serve` sẽ chạy
EXPOSE 8000

# Lệnh để khởi động Laravel development server
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

# Nếu bạn muốn chuyển sang PHP-FPM cho Nginx (khuyến nghị cho môi trường giống production hơn):
# EXPOSE 9000
# CMD ["php-fpm"]