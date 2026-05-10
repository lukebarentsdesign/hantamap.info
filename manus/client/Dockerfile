FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml* package-lock.json* ./

RUN npm install -g pnpm && pnpm install --frozen-lockfile || npm install

COPY . .

RUN pnpm build || npm run build

EXPOSE 3000

CMD ["pnpm", "dev", "--host"]
