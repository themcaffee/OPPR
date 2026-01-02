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
RUN turbo prune frontend-next --docker

# =============================================================================
# Stage 3: Installer - Install dependencies with pruned lockfile (cached layer)
# =============================================================================
FROM base AS installer

# Copy only files needed for dependency installation
# This layer is cached unless lockfile or package.json changes
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Install dependencies
RUN pnpm install --frozen-lockfile

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

# Next.js public env vars (must be set at build time)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build packages in dependency order
RUN pnpm turbo run build --filter=frontend-next...

# =============================================================================
# Stage 5: Production - Minimal runtime image with Next.js standalone
# =============================================================================
FROM base AS production

# Set production environment
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

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
