# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine3.21 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY tsconfig.json ./
COPY src/ ./src/
COPY prisma/ ./prisma/

RUN npm run prisma:generate && npm run build

# ─── Stage 2: Production ─────────────────────────────────────────────────────
FROM node:20-alpine3.21 AS production

# dumb-init handles PID 1 signals (SIGTERM/SIGINT) for graceful shutdown
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy compiled output and Prisma client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma/ ./prisma/

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
