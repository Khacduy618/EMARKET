FROM node:18-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Tạo file pnpm-lock.yaml rỗng nếu chưa có, để lệnh COPY không báo lỗi
# và để pnpm install không bị cảnh báo thiếu lock file (nếu bạn chưa có).
# Nếu bạn luôn có pnpm-lock.yaml, dòng này có thể không cần.
RUN touch pnpm-lock.yaml

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install
RUN pnpm lucide-react

EXPOSE 3000
CMD ["pnpm", "run", "dev"]