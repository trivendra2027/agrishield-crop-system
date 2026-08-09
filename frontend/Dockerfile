# Stage 1: Build React SPA
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package configuration
COPY frontend/package*.json ./
RUN npm ci || npm install

# Copy source code
COPY frontend/ ./

# Build arguments for environment variables
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}

# Build production bundle
RUN npm run build

# Stage 2: Production Nginx Runtime (Non-root)
FROM nginx:alpine-slim AS runtime

# Install libcap and curl for health checks and non-root port binding
RUN apk add --no-cache curl libcap && \
    setcap 'cap_net_bind_service=+ep' /usr/sbin/nginx

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy compiled static assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Set appropriate permissions for non-root execution
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run /tmp/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx /var/run /tmp/nginx /etc/nginx

USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
