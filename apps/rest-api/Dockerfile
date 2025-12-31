# =============================================================================
# Stage 1: Base - Install pnpm and set up common configuration
# =============================================================================
FROM node:22-alpine AS base

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# =============================================================================
# Stage 2: Dependencies - Install all dependencies with full monorepo context
# =============================================================================
FROM base AS deps

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy package.json files for all workspace packages (preserve structure)
COPY packages/core/package.json ./packages/core/
COPY packages/db-prisma/package.json ./packages/db-prisma/
COPY apps/rest-api/package.json ./apps/rest-api/

# Copy Prisma schema (needed for prisma generate during install)
COPY packages/db-prisma/prisma ./packages/db-prisma/prisma/

# Install all dependencies (frozen lockfile for reproducibility)
RUN pnpm install --frozen-lockfile

# Generate Prisma client (MUST happen after install, before build)
RUN pnpm --filter @opprs/db-prisma run db:generate

# =============================================================================
# Stage 3: Builder - Build all packages
# =============================================================================
FROM deps AS builder

# Copy source files for all packages
COPY packages/core/src ./packages/core/src/
COPY packages/core/tsconfig.json ./packages/core/
COPY packages/db-prisma/src ./packages/db-prisma/src/
COPY packages/db-prisma/tsconfig.json ./packages/db-prisma/
COPY apps/rest-api/src ./apps/rest-api/src/
COPY apps/rest-api/tsconfig.json ./apps/rest-api/

# Build packages in dependency order using turbo
RUN pnpm run build --filter=rest-api...

# =============================================================================
# Stage 4: Production - Minimal runtime image
# =============================================================================
FROM base AS production

# Copy workspace configuration
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./

# Copy package manifests
COPY --from=builder /app/packages/core/package.json ./packages/core/
COPY --from=builder /app/packages/db-prisma/package.json ./packages/db-prisma/
COPY --from=builder /app/apps/rest-api/package.json ./apps/rest-api/

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
