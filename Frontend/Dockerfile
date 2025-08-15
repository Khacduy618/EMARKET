# frontend/Dockerfile

# --- STAGE 1: Build ---
FROM node:18-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# Biến môi trường lúc build sẽ được truyền qua lệnh `docker build`
ARG NEXT_PUBLIC_BACKEND_URL
RUN NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL} pnpm build

# --- STAGE 2: Production ---
FROM node:18-alpine
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
RUN corepack enable
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder /app/package.json ./package.json
USER nextjs
EXPOSE 3000
ENV NODE_ENV=production
CMD ["pnpm", "start"]