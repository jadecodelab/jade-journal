FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

# Install dependencies
COPY package.json pnpm.yaml pnpm-lock.yaml* ./
RUN pnpm install --ignore-scripts
RUN pnpm exec prisma generate

# Copy source and build frontend
COPY . .
RUN pnpm build

# Persistent volume for SQLite
VOLUME /app/prisma/data
ENV DATABASE_URL="file:/app/prisma/data/prod.db"
ENV NODE_ENV=production

EXPOSE 3001

CMD ["sh", "-c", "pnpm exec prisma migrate deploy && pnpm exec tsx server/index.ts"]
