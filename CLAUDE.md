# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OPPRS (Open Pinball Player Ranking System) is a TypeScript monorepo for calculating pinball tournament rankings and player ratings. Uses Turborepo + pnpm workspaces.

## Commands

```bash
# Setup
pnpm install
pnpm --filter @opprs/db-prisma run db:generate  # Required: generate Prisma client

# Development
pnpm run dev              # Run all packages in dev mode
pnpm docs:dev             # Documentation site locally

# Testing
pnpm run test             # Run all tests
pnpm run test:watch       # Watch mode
pnpm run test:coverage    # With coverage

# Single package tests
pnpm --filter @opprs/core test
pnpm --filter @opprs/db-prisma test

# Code Quality
pnpm run lint             # Lint all
pnpm run lint:fix         # Auto-fix
pnpm run format           # Format with Prettier
pnpm run typecheck        # Type check all

# Build
pnpm run build            # Build all packages
pnpm docs:build           # Build documentation

# Database (db-prisma only)
pnpm --filter @opprs/db-prisma run db:migrate     # Run migrations
pnpm --filter @opprs/db-prisma run db:studio      # Prisma Studio GUI
pnpm --filter @opprs/db-prisma run db:seed        # Seed data
```

## Architecture

```
packages/
  core/           # @opprs/core - Main calculation library (npm published)
  db-prisma/      # @opprs/db-prisma - PostgreSQL persistence layer
apps/
  demo/           # React + Vite interactive demo
docs/             # VitePress documentation
```

### @opprs/core

Pure TypeScript library with no runtime dependencies. Exports all functions/types from single entry point (`src/index.ts`).

Key modules:
- `base-value.ts` - Tournament base value (0.5 pts per rated player, max 32)
- `tva-rating.ts` - Tournament Value Adjustment from Glicko ratings (max 25 pts)
- `tva-ranking.ts` - TVA from world rankings (max 50 pts)
- `tgp.ts` - Tournament Grading Percentage (format quality 0-200%)
- `event-boosters.ts` - Multipliers for majors/championships (1.0x-2.0x)
- `point-distribution.ts` - Linear (10%) and dynamic (90%) point allocation
- `time-decay.ts` - Point depreciation (100%/75%/50%/0% over 3 years)
- `rating.ts` - Glicko rating system implementation
- `config.ts` - Runtime configuration via `configureOPPR()`/`resetConfig()`
- `validators.ts` - Input validation with `ValidationError` class

Build output: ESM + CJS + TypeScript declarations via tsup.

### @opprs/db-prisma

PostgreSQL persistence using Prisma ORM. Peer depends on @opprs/core.

Schema models:
- `Player` - Profile with Glicko rating, RD, ranking
- `Tournament` - Event data with TGP config (JSON), calculated values
- `TournamentResult` - Junction table with position, points, decay tracking

Exports query helpers for common operations from `src/index.ts`.

### demo

React 19 + Vite + Tailwind CSS + Recharts. Workspace dependency on @opprs/core. Base path `/OPPR/demo/` for GitHub Pages deployment.

## Code Style

- ESLint flat config with TypeScript-ESLint
- Prettier: single quotes, trailing commas (es5), 100 char width
- Unused vars with `_` prefix are allowed
- `@typescript-eslint/no-explicit-any`: error
- Strict TypeScript mode across all packages

## Testing

Vitest with v8 coverage. Tests in `tests/` directory for each package.

db-prisma uses @testcontainers/postgresql for integration tests with real database.

## Git Commits

- Do not add Claude attribution to commit messages
- Never commit `CLAUDE.md` or `.claude/` files
