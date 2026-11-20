# Multi-stage Docker build for Realdha Backend
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

# Production runtime container
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY src/ ./src/

# Run with non-root security context
USER node

EXPOSE 8080

CMD ["node", "src/index.js"]
