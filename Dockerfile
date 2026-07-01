FROM node:20-alpine AS base
RUN npm install -g pnpm

# Build stage
FROM base AS builder
WORKDIR /app
COPY package.json pnpm.yaml pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm exec prisma generate
COPY . .
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner
RUN npm install -g pnpm
WORKDIR /app

COPY package.json pnpm.yaml pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts
RUN pnpm exec prisma generate

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY server ./server

VOLUME /app/prisma/data
ENV DATABASE_URL="file:/app/prisma/data/prod.db"
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node -e \"require('./server/index.ts')\""]
