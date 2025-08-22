pnpm dlx shadcn@latest init

pnpm dlx shadcn@latest add alert  

pnpm dlx shadcn@latest add calendar popover

rm -rf public/storage

php artisan storage:link


run docker
docker compose -f docker-minh-compose.yml up --build -d
