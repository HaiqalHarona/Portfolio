# Stage 1: Build the Astro project
FROM node:20-alpine AS builder
WORKDIR /app

# Enable pnpm via corepack (or npm install -g pnpm)
RUN npm install -g pnpm

# Copy package lockfiles first for Docker layer caching
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source files and execute production build
COPY . .
RUN pnpm run build

# Stage 2: Serve with lightweight Nginx
FROM nginx:alpine

# Copy built static site from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
