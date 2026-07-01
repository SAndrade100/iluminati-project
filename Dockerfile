# =============================================================================
# Multi-stage Dockerfile para o monorepo Iluminati
# Uso: docker build --build-arg APP=gateway -t iluminati/gateway .
# =============================================================================

ARG APP=gateway

# ─── Stage 1: deps ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ─── Stage 2: build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
ARG APP
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copia apenas o necessário para o build
COPY tsconfig*.json nest-cli.json prisma.config.ts ./
COPY prisma ./prisma
COPY apps ./apps
COPY libs ./libs

# Gera o Prisma client antes de compilar
RUN npx prisma generate

RUN npx nest build ${APP}

# ─── Stage 3: runner ───────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
ARG APP
ENV APP_NAME=${APP}
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nestjs

WORKDIR /app

# Copia dependências de produção
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copia o build compilado
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Copia o cliente gerado do Prisma (necessário em runtime)
COPY --from=builder --chown=nestjs:nodejs /app/libs/database/src/generated ./libs/database/src/generated

USER nestjs

# O entrypoint usa APP_NAME para localizar o bundle correto
CMD node dist/apps/${APP_NAME}/main
