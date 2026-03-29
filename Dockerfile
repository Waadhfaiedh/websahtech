# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for layer caching
COPY package.json package-lock.json* ./

RUN npm install --frozen-lockfile 2>/dev/null || npm install

# Copy source
COPY . .

# Build the Vite app
RUN npm run build

# ── Stage 2: Serve with nginx ────────────────────────────────────
FROM nginx:1.25-alpine

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
