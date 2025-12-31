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
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./

# Copy package.json files for required workspace packages (preserve structure)
COPY packages/core/package.json ./packages/core/
COPY apps/frontend-next/package.json ./apps/frontend-next/

# Install all dependencies (frozen lockfile for reproducibility)
RUN pnpm install --frozen-lockfile

# =============================================================================
# Stage 3: Builder - Build all packages
# =============================================================================
FROM deps AS builder

# Copy source files for core package
COPY packages/core/src ./packages/core/src/
COPY packages/core/tsconfig.json ./packages/core/

# Copy source files for frontend-next
COPY apps/frontend-next/app ./apps/frontend-next/app/
COPY apps/frontend-next/components ./apps/frontend-next/components/
COPY apps/frontend-next/lib ./apps/frontend-next/lib/
COPY apps/frontend-next/tsconfig.json ./apps/frontend-next/
COPY apps/frontend-next/next.config.ts ./apps/frontend-next/
COPY apps/frontend-next/postcss.config.js ./apps/frontend-next/

# Copy public folder if it exists (optional in Next.js)
COPY apps/frontend-next/public* ./apps/frontend-next/

# Build packages in dependency order using turbo
RUN pnpm run build --filter=frontend-next...

# =============================================================================
# Stage 4: Production - Minimal runtime image with Next.js standalone
# =============================================================================
FROM base AS production

# Set production environment
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output from builder
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend-next/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend-next/.next/static ./apps/frontend-next/.next/static

# Copy public folder if it exists
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend-next/public* ./apps/frontend-next/

USER nextjs

# Expose port
EXPOSE 3000

# Set working directory for runtime
WORKDIR /app/apps/frontend-next

CMD ["node", "server.js"]
