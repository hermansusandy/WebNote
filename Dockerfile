FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci --legacy-peer-deps
RUN npm run build

FROM node:20-alpine AS runner
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
