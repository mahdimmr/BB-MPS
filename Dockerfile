# syntax=docker/dockerfile:1

ARG NODE_VERSION=24-bookworm-slim

# -------------------------------------------
# Install dependencies
# -------------------------------------------
FROM node:${NODE_VERSION} AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
  npm ci --no-audit --no-fund --dangerously-allow-all-scripts

# -------------------------------------------
# Build Next.js (standalone) + Prisma client
# -------------------------------------------
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# env.ts and prisma.config.ts require these at build time; Compose overrides them at runtime.
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build?schema=public" \
    SESSION_SECRET="build-time-placeholder-secret" \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    TZ=Asia/Tehran

RUN mkdir -p public \
  && npm run build

# -------------------------------------------
# One-shot migrate + seed (used by Compose)
# -------------------------------------------
FROM node:${NODE_VERSION} AS migrate

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    TZ=Asia/Tehran

COPY package.json package-lock.json prisma.config.ts tsconfig.json ./
COPY prisma ./prisma
COPY src/lib/auth ./src/lib/auth
COPY scripts/docker-migrate.sh ./scripts/docker-migrate.sh
COPY --from=deps /app/node_modules ./node_modules

RUN chmod +x ./scripts/docker-migrate.sh

CMD ["./scripts/docker-migrate.sh"]

# -------------------------------------------
# Production runner
# -------------------------------------------
FROM node:${NODE_VERSION} AS runner

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    TZ=Asia/Tehran

RUN mkdir -p public .next \
  && chown node:node /app .next public

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

CMD ["node", "server.js"]
