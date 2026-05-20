FROM node:18-alpine

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY . .
RUN pnpm build

EXPOSE 3001

CMD ["node", "dist/app.js"]
