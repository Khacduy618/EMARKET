FROM node:18-alpine

WORKDIR /usr/src/app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package*.json ./
COPY pnpm-lock.yaml ./ 

 
RUN pnpm install --prod --frozen-lockfile


COPY . .

EXPOSE 3002 

CMD [ "node", "server.js" ]
# CMD [ "pnpm", "run", "dev" ]