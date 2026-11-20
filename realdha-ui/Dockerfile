# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies based on lockfile
COPY package.json package-lock.json ./
RUN npm ci

# Copy project files and build
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine

# Cloud Run injects the PORT environment variable (default: 8080)
ENV PORT=8080
# Restrict envsubst to PORT and BACKEND_URL in nginx templates
ENV NGINX_ENVSUBST_FILTER="PORT|BACKEND_URL"
# Default keeps nginx valid when BACKEND_URL is not injected (local docker run)
ENV BACKEND_URL="http://localhost:8081"

# Copy nginx configuration template
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy compiled static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
