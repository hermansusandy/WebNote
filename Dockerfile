FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy the standalone output to the path the NAS is looking for
RUN mkdir -p .next
COPY --from=builder /app/.next/standalone .next/standalone/
COPY --from=builder /app/public .next/standalone/public
COPY --from=builder /app/.next/static .next/standalone/.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# This matches the path the NAS build is looking for
CMD ["node", ".next/standalone/server.js"]
