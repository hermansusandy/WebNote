FROM node:20-alpine AS builder
# Add libc6-compat for lightningcss/native modules compatibility on Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
# Use npm install instead of npm ci so that Linux-specific optional dependencies (like lightningcss bindings) are downloaded
RUN npm install --legacy-peer-deps
# Explicitly install the missing native modules for Alpine Linux (musl)
RUN npm install --no-save lightningcss-linux-x64-musl@1.32.0 lightningcss-linux-arm64-musl@1.32.0
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
# Add libc6-compat for lightningcss/native modules compatibility on Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# The NAS environment expects server.js at .next/standalone/server.js
RUN mkdir -p .next
COPY --from=builder /app/.next/standalone .next/standalone/
COPY --from=builder /app/.next/static .next/standalone/.next/static
COPY --from=builder /app/public .next/standalone/public

EXPOSE 3000

# This matches the path the NAS build is looking for
CMD ["node", ".next/standalone/server.js"]
