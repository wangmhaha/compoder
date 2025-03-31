# --------- Dependencies Installation Stage -----------
FROM node:18.17-alpine AS deps
WORKDIR /app

ARG proxy

RUN apk add --no-cache libc6-compat && npm install -g pnpm@9.8.0
# If proxy is provided, set npm mirror
RUN [ -z "$proxy" ] || pnpm config set registry https://registry.npmmirror.com/

# Copy dependency manifests
COPY package.json ./

# Install dependencies
RUN pnpm install

# --------- Build Stage -----------
FROM node:18.17-alpine AS builder
WORKDIR /app

ARG proxy

RUN apk add --no-cache libc6-compat && npm install -g pnpm@9.8.0

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
RUN pnpm build

# --------- Runtime Stage -----------
FROM nginx:stable-alpine AS runner

ARG proxy

# Copy build artifacts
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/package.json /usr/share/nginx/html/

# Create a custom nginx configuration
RUN echo 'server { \
    listen 3000; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Set environment variables
ENV PORT 3000

EXPOSE 3000

# Health check to validate application is running properly
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]