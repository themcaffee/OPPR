# OPPRS - Open Pinball Player Ranking System

A comprehensive TypeScript library for calculating pinball tournament rankings and player ratings. This library implements a complete ranking system with support for various tournament formats, player ratings, and point distribution calculations.

## Documentation

Full documentation is available in the `/docs` folder. To view the documentation locally:

```bash
pnpm install
pnpm docs:dev
```

### Documentation Contents

- **[Getting Started](./docs/getting-started.md)** - Installation and quick start guide
- **[Configuration](./docs/configuration.md)** - Customize constants and calculation parameters
- **[Core Concepts](./docs/core-concepts.md)** - Base Value, TVA, TGP, Event Boosters, Point Distribution, Time Decay, and Glicko Rating
- **[Constants & Calibration](./docs/constants.md)** - Detailed rationale for all system constants
- **[API Reference](./docs/api-reference.md)** - Complete types and function reference
- **[Database (Prisma)](./docs/db-prisma.md)** - PostgreSQL persistence with Prisma ORM
- **[REST API](./docs/rest-api.md)** - Fastify REST API with JWT authentication

## Monorepo Structure

This project is organized as a monorepo using [Turborepo](https://turbo.build/) and [pnpm workspaces](https://pnpm.io/workspaces):

```
.
├── packages/
│   ├── core/              # @opprs/core - Main TypeScript library
│   ├── db-prisma/         # @opprs/db-prisma - PostgreSQL persistence layer
│   └── matchplay-api/     # @opprs/matchplay-api - Matchplay Events API client
├── apps/
│   ├── demo/              # Interactive React demo application
│   ├── rest-api/          # Fastify REST API server
│   └── frontend-next/     # Next.js web frontend
├── docs/                  # VitePress documentation
├── deploy/                # Deployment configuration (Terraform + Caddy)
├── turbo.json             # Turborepo pipeline configuration
├── pnpm-workspace.yaml    # pnpm workspace configuration
└── package.json           # Root package.json with shared scripts
```

### Packages

- **@opprs/core** (`packages/core/`) - The core OPPRS library, published to npm
- **@opprs/db-prisma** (`packages/db-prisma/`) - PostgreSQL persistence layer using Prisma ORM
- **@opprs/matchplay-api** (`packages/matchplay-api/`) - Matchplay Events API client with transformers for OPPR types
- **demo** (`apps/demo/`) - Interactive React + Vite demo application for testing and visualization
- **rest-api** (`apps/rest-api/`) - Fastify REST API with JWT auth, CRUD endpoints, and OpenAPI docs
- **frontend-next** (`apps/frontend-next/`) - Next.js 15 web frontend with React 19, Tailwind CSS 4, and Docker support
- **docs** (`docs/`) - VitePress documentation site
- **deploy** (`deploy/`) - Deployment infrastructure with Terraform (Digital Ocean) and Caddy reverse proxy

## Features

- **Configurable Constants** - Override any calculation constant to customize the ranking system
- **Base Value Calculation** - Tournament value based on number of rated players
- **Tournament Value Adjustment (TVA)** - Strength indicators from player ratings and rankings
- **Tournament Grading Percentage (TGP)** - Format quality assessment
- **Event Boosters** - Multipliers for major championships and certified events
- **Point Distribution** - Linear and dynamic point allocation
- **Time Decay** - Automatic point depreciation over time
- **Glicko Rating System** - Player skill rating with uncertainty
- **Efficiency Tracking** - Performance metrics
- **Input Validation** - Comprehensive data validation
- **TypeScript First** - Full type safety and IntelliSense support

## Installation

```bash
npm install @opprs/core
```

Or with other package managers:

```bash
# pnpm
pnpm add @opprs/core

# yarn
yarn add @opprs/core
```

See the [Getting Started](./docs/getting-started.md) guide for usage examples.

## Development

This project uses [pnpm](https://pnpm.io/) and [Turborepo](https://turbo.build/) for monorepo management.

### Setup

```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Install dependencies
pnpm install
```

### Common Commands

```bash
# Build all packages
pnpm run build

# Run all tests
pnpm run test

# Run tests with coverage
pnpm run test:coverage

# Run tests in watch mode
pnpm run test:watch

# Lint all packages
pnpm run lint

# Fix linting issues
pnpm run lint:fix

# Format all code
pnpm run format

# Check formatting
pnpm run format:check

# Type check all packages
pnpm run typecheck

# Run demo app in development mode
pnpm run dev

# Run documentation site in development mode
pnpm run docs:dev

# Build documentation site
pnpm run docs:build
```

### Working with Specific Packages

```bash
# Build only the core package
pnpm --filter @opprs/core build

# Run tests only for core package
pnpm --filter @opprs/core test

# Run the demo app
pnpm --filter demo dev
```

### Turborepo

Turborepo automatically handles task dependencies and caching:

- Building the demo will automatically build the core package first
- Test and lint tasks run in parallel where possible
- Build outputs are cached for faster subsequent runs

## Testing

The library includes comprehensive unit and integration tests with 95%+ coverage:

```bash
# Run all tests
pnpm run test

# Run tests with coverage
pnpm run test:coverage

# Run tests in watch mode
pnpm run test:watch
```

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Acknowledgments

This library implements a ranking system based on tournament ranking principles for competitive pinball events.
