### Cập nhật bảng `flatformcategories`

- Thêm trường mới:

      | Tên trường | Kiểu dữ liệu | Mặc định |
      |------------|--------------|----------|
      | `Deleted`  | `TINYINT(1)` | `0`      |
edit  | `icon`     |              |`allow null`    |
- Đã pull code từ nhánh `main` về lúc **09:43 - 18/06/2025**

pnpm dlx shadcn@latest init

pnpm dlx shadcn@latest add alert  

pnpm dlx shadcn@latest add calendar popover

rm -rf public/storage

php artisan storage:link


Bỏ theo dõi 
docker-compose.yml