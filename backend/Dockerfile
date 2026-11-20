# Multi-stage Bun build for Realdha Backend
FROM oven/bun:1.4.5-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

# Production runtime container
FROM oven/bun:1.4.5-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY src/ ./src/
COPY tsconfig.json ./

# Run as non-root bun user
USER bun

EXPOSE 8080

CMD ["bun", "run", "src/index.ts"]
