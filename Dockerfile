FROM node:20-slim

# Prisma needs openssl
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm

WORKDIR /app

# Install dependencies
COPY package.json pnpm.yaml pnpm-workspace.yaml pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm exec prisma generate

# Copy source and build frontend
COPY . .
RUN pnpm build

ENV NODE_ENV=production

EXPOSE 3001

CMD ["sh", "-c", "pnpm exec prisma migrate deploy && pnpm exec tsx server/index.ts"]
