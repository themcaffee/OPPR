# =============================================================================
# Stage 1: Base - Install pnpm and turbo
# =============================================================================
FROM node:22-alpine AS base

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Set up pnpm global bin directory
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN pnpm add -g turbo@^2

WORKDIR /app

# =============================================================================
# Stage 2: Pruner - Create optimized monorepo subset using turbo prune
# =============================================================================
FROM base AS pruner

COPY . .
RUN turbo prune rest-api --docker

# =============================================================================
# Stage 3: Installer - Install dependencies with pruned lockfile (cached layer)
# =============================================================================
FROM base AS installer

# Copy only files needed for dependency installation
# This layer is cached unless lockfile or package.json changes
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Copy Prisma schema (needed for prisma generate during install)
COPY --from=pruner /app/out/full/packages/db-prisma/prisma ./packages/db-prisma/prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpm --filter @opprs/db-prisma run db:generate

# =============================================================================
# Stage 4: Builder - Build all packages with remote caching support
# =============================================================================
FROM installer AS builder

# Copy source files from pruned subset
COPY --from=pruner /app/out/full/ .

# Copy root tsconfig.json (needed for packages that extend it)
COPY --from=pruner /app/tsconfig.json ./tsconfig.json

# Remote caching support (optional, passed via --build-arg)
ARG TURBO_TEAM
ARG TURBO_TOKEN
ENV TURBO_TEAM=${TURBO_TEAM}
ENV TURBO_TOKEN=${TURBO_TOKEN}

# Build packages in dependency order
RUN pnpm turbo run build --filter=rest-api...

# =============================================================================
# Stage 5: Production - Minimal runtime image
# =============================================================================
FROM base AS production

# Copy workspace configuration from pruner (already minimal)
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Copy Prisma schema and seed (needed for migrations and seeding at runtime)
COPY --from=builder /app/packages/db-prisma/prisma ./packages/db-prisma/prisma/

# Install all dependencies (including devDeps for prisma CLI and tsx)
# Note: Using full install instead of --prod because:
# 1. Prisma client generation requires prisma CLI at runtime for migrations
# 2. tsx is needed for running seed scripts
# 3. pnpm's nested structure makes copying generated client complex
RUN pnpm install --frozen-lockfile

# Generate Prisma client for production platform
RUN pnpm --filter @opprs/db-prisma run db:generate

# Set production environment
ENV NODE_ENV=production

# Copy built packages
COPY --from=builder /app/packages/core/dist ./packages/core/dist/
COPY --from=builder /app/packages/db-prisma/dist ./packages/db-prisma/dist/
COPY --from=builder /app/packages/matchplay-api/dist ./packages/matchplay-api/dist/
COPY --from=builder /app/apps/rest-api/dist ./apps/rest-api/dist/

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy entrypoint script and set permissions
COPY --chmod=755 apps/rest-api/docker-entrypoint.sh /docker-entrypoint.sh

# Change ownership of app directory to nodejs user
RUN chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3000

# Set working directory for runtime
WORKDIR /app/apps/rest-api

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
