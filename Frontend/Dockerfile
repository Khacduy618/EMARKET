FROM node:18-alpine

# Sử dụng corepack để quản lý pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Tạo file pnpm-lock.yaml rỗng nếu chưa có, để lệnh COPY không báo lỗi
# và để pnpm install không bị cảnh báo thiếu lock file.
# Nếu bạn luôn commit pnpm-lock.yaml, dòng này có thể bỏ.
# RUN touch pnpm-lock.yaml

COPY package.json pnpm-lock.yaml* ./
# Hoặc nếu chỉ có pnpm-lock.yaml:
# COPY package.json ./
# COPY pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . . 

EXPOSE 3000

CMD ["pnpm", "run", "dev"]
