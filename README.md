# OPPRS - Open Pinball Player Ranking System

A complete system for calculating and managing pinball tournament rankings and player ratings. OPPRS provides a REST API, web frontend, and database persistence layer, all deployable via Docker Compose.

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

### Running with Docker Compose

```bash
# Clone the repository
git clone https://github.com/themcaffee/OPPR.git
cd OPPR

# Copy and configure environment variables
cp .env.example .env

# Start all services
docker compose up -d

# View logs
docker compose logs -f
```

Once running, access:
- **Frontend**: http://localhost (Next.js web app)
- **API**: http://localhost/api (REST API with OpenAPI docs at `/api/docs`)
- **Minimal Frontend**: http://localhost/minimal (Static HTML5 version)

### Seeding Sample Data

To populate the database with sample data for development:

```bash
docker compose --profile seed up seed
```

Or set `SEED_DATABASE=true` in your `.env` file before starting.

## Services

The Docker Compose stack includes:

| Service | Description |
|---------|-------------|
| **postgres** | PostgreSQL 16 database |
| **rest-api** | Fastify REST API with JWT authentication |
| **frontend-next** | Next.js 15 web frontend |
| **frontend-minimal** | Lightweight static HTML5 frontend |
| **caddy** | Reverse proxy with automatic HTTPS |

## Configuration

All configuration is done via environment variables. See `.env.example` for the complete list.

Key settings:

| Variable | Description | Default |
|----------|-------------|---------|
| `DOMAIN` | Domain for Caddy (auto-HTTPS in production) | `localhost` |
| `POSTGRES_PASSWORD` | Database password | `oppr_dev_password` |
| `JWT_SECRET` | JWT signing key | Change in production! |
| `JWT_REFRESH_SECRET` | JWT refresh token key | Change in production! |
| `RUN_MIGRATIONS` | Run DB migrations on startup | `true` |
| `SEED_DATABASE` | Seed sample data on startup | `false` |

## Production Deployment

For production deployments:

1. **Set your domain**: Update `DOMAIN` in `.env` to your actual domain. Caddy will automatically obtain and renew SSL certificates via Let's Encrypt.

2. **Generate secure secrets**:
   ```bash
   # Generate random JWT secrets
   openssl rand -base64 32  # Use for JWT_SECRET
   openssl rand -base64 32  # Use for JWT_REFRESH_SECRET
   ```

3. **Set a strong database password**: Update `POSTGRES_PASSWORD` with a secure password.

4. **Infrastructure**: The `deploy/` directory contains Terraform configurations for Digital Ocean and Caddy reverse proxy setup.

## Documentation

Full documentation is available in the `/docs` folder:

- **[Getting Started](./docs/getting-started.md)** - Quick start guide
- **[Configuration](./docs/configuration.md)** - Customize calculation parameters
- **[Core Concepts](./docs/core-concepts.md)** - Base Value, TVA, TGP, Event Boosters, Point Distribution, Time Decay, and Glicko Rating
- **[Constants & Calibration](./docs/constants.md)** - Detailed rationale for all system constants
- **[API Reference](./docs/api-reference.md)** - Complete types and function reference
- **[Database (Prisma)](./docs/db-prisma.md)** - PostgreSQL persistence with Prisma ORM
- **[REST API](./docs/rest-api.md)** - Fastify REST API with JWT authentication

To run the documentation site locally:

```bash
pnpm install
pnpm docs:dev
```

## Monorepo Structure

This project is organized as a monorepo using [Turborepo](https://turbo.build/) and [pnpm workspaces](https://pnpm.io/workspaces):

```
.
├── packages/
│   ├── core/              # @opprs/core - Core calculation library (npm)
│   ├── db-prisma/         # @opprs/db-prisma - PostgreSQL persistence
│   └── matchplay-api/     # @opprs/matchplay-api - Matchplay Events API client
├── apps/
│   ├── rest-api/          # Fastify REST API server
│   ├── frontend-next/     # Next.js web frontend
│   ├── frontend-minimal/  # Static HTML5 frontend
│   └── demo/              # Interactive React demo
├── docs/                  # VitePress documentation
└── deploy/                # Terraform + Caddy deployment configs
```

## NPM Packages

The core calculation library is also published to npm for standalone use:

```bash
npm install @opprs/core
```

See the [Getting Started](./docs/getting-started.md) guide for library usage examples.

## Development

For contributors working on the codebase:

```bash
# Install pnpm
npm install -g pnpm

# Install dependencies
pnpm install

# Generate Prisma client (required)
pnpm --filter @opprs/db-prisma run db:generate

# Run all packages in dev mode
pnpm run dev

# Build all packages
pnpm run build

# Run tests
pnpm run test

# Lint and format
pnpm run lint
pnpm run format

# Type check
pnpm run typecheck
```

### Working with Specific Packages

```bash
pnpm --filter @opprs/core test      # Test core package
pnpm --filter @opprs/core build     # Build core package
pnpm --filter demo dev              # Run demo app
```

## Testing

```bash
pnpm run test              # Run all tests
pnpm run test:coverage     # With coverage
pnpm run test:watch        # Watch mode
```

## License

AGPL-3.0-or-later - see LICENSE file for details.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Acknowledgments

This system implements tournament ranking principles for competitive pinball events.
