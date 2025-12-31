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

# Copy package.json files for required workspace packages
COPY packages/core/package.json ./packages/core/
COPY apps/frontend-next/package.json ./apps/frontend-next/

# Install all dependencies (frozen lockfile for reproducibility)
RUN pnpm install --frozen-lockfile

# =============================================================================
# Stage 3: Builder - Build all packages
# =============================================================================
FROM deps AS builder

# Copy root tsconfig (needed for packages that extend it)
COPY tsconfig.json ./

# Copy source files for @opprs/core (dependency of frontend-next)
COPY packages/core/src ./packages/core/src/
COPY packages/core/tsconfig.json ./packages/core/

# Copy source files for frontend-next
COPY apps/frontend-next/app ./apps/frontend-next/app/
COPY apps/frontend-next/components ./apps/frontend-next/components/
COPY apps/frontend-next/lib ./apps/frontend-next/lib/
COPY apps/frontend-next/next.config.ts ./apps/frontend-next/
COPY apps/frontend-next/tsconfig.json ./apps/frontend-next/
COPY apps/frontend-next/postcss.config.js ./apps/frontend-next/
COPY apps/frontend-next/next-env.d.ts ./apps/frontend-next/

# Build packages in dependency order using turbo
# Set NEXT_TELEMETRY_DISABLED to avoid telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build --filter=frontend-next...

# =============================================================================
# Stage 4: Production - Minimal runtime image with standalone Next.js
# =============================================================================
FROM node:22-alpine AS production

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output from builder
# Next.js standalone creates the full monorepo structure
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend-next/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend-next/.next/static ./apps/frontend-next/.next/static

USER nextjs

# Expose port
EXPOSE 3000

# Set hostname to listen on all interfaces
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# The standalone output creates server.js at the app path
WORKDIR /app/apps/frontend-next
CMD ["node", "server.js"]
