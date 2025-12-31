# OPPRS REST API

Fastify-based REST API server for the Open Pinball Player Ranking System (OPPRS). Provides a complete HTTP interface for managing players, tournaments, results, and rankings with JWT authentication and OpenAPI documentation.

## Features

- **JWT Authentication** - Secure token-based auth with access/refresh token flow
- **Full CRUD Operations** - Create, read, update, delete for all resources
- **Player Management** - Player profiles with Glicko ratings, rankings, and statistics
- **Tournament Management** - Tournament data with TGP, TVA, and event boosters
- **Results Tracking** - Tournament results with point calculations and time decay
- **Leaderboards** - Top players by rating or world ranking
- **Search & Filtering** - Full-text search, pagination, sorting, and filtering
- **Batch Operations** - Bulk result creation and decay recalculation
- **OpenAPI Documentation** - Auto-generated Swagger UI at `/docs`
- **CORS Support** - Cross-origin requests enabled

## Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm (recommended) or npm

## Getting Started

### 1. Install Dependencies

From the monorepo root:

```bash
pnpm install
```

### 2. Set Up the Database

Generate the Prisma client and run migrations:

```bash
pnpm --filter @opprs/db-prisma run db:generate
pnpm --filter @opprs/db-prisma run db:migrate
```

### 3. Configure Environment Variables

Create a `.env` file in `apps/rest-api/` or set environment variables:

```bash
# Server
HOST=0.0.0.0
PORT=3000
LOG_LEVEL=info
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your-secure-secret-key
JWT_REFRESH_SECRET=your-secure-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Database (inherited from @opprs/db-prisma)
DATABASE_URL=postgresql://user:password@localhost:5432/opprs
```

### 4. Start the Server

```bash
# Development (with hot reload)
pnpm --filter rest-api dev

# Production
pnpm --filter rest-api build
pnpm --filter rest-api start
```

The API will be available at `http://localhost:3000`.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `0.0.0.0` | Server host address |
| `PORT` | `3000` | Server port |
| `LOG_LEVEL` | `info` | Logging level (trace, debug, info, warn, error) |
| `NODE_ENV` | `development` | Environment (development, production) |
| `JWT_SECRET` | - | Secret key for access tokens (required in production) |
| `JWT_REFRESH_SECRET` | - | Secret key for refresh tokens (required in production) |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token expiration time |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token expiration time |
| `DATABASE_URL` | - | PostgreSQL connection string |

## API Documentation

Interactive Swagger UI documentation is available at:

```
http://localhost:3000/docs
```

### API Overview

All API endpoints are versioned under `/api/v1`. Most endpoints require JWT authentication.

| Resource | Endpoints | Description |
|----------|-----------|-------------|
| Health | `GET /health` | Health check (no auth required) |
| Auth | `/api/v1/auth/*` | Login, refresh, logout, current user |
| Players | `/api/v1/players/*` | Player CRUD, search, stats, leaderboards |
| Tournaments | `/api/v1/tournaments/*` | Tournament CRUD, search, majors |
| Results | `/api/v1/results/*` | Result CRUD, batch create, decay recalc |
| Stats | `/api/v1/stats/*` | System overview, leaderboards |

### Authentication Flow

1. **Login**: `POST /api/v1/auth/login` with email/password to get tokens
2. **Use Token**: Include `Authorization: Bearer <access_token>` header
3. **Refresh**: `POST /api/v1/auth/refresh` when access token expires
4. **Logout**: `POST /api/v1/auth/logout` to revoke refresh token

## Project Structure

```
apps/rest-api/
├── src/
│   ├── config/           # Environment and Swagger configuration
│   │   ├── env.ts
│   │   └── swagger.ts
│   ├── middleware/       # Error handling middleware
│   │   └── error-handler.ts
│   ├── plugins/          # Fastify plugins
│   │   ├── auth.ts       # JWT authentication
│   │   ├── cors.ts       # CORS configuration
│   │   ├── database.ts   # Prisma client
│   │   └── swagger.ts    # OpenAPI documentation
│   ├── routes/           # API route handlers
│   │   ├── v1/           # Version 1 endpoints
│   │   │   ├── auth.ts
│   │   │   ├── players.ts
│   │   │   ├── results.ts
│   │   │   ├── stats.ts
│   │   │   └── tournaments.ts
│   │   ├── health.ts
│   │   └── index.ts
│   ├── schemas/          # JSON Schema definitions
│   │   ├── auth.ts
│   │   ├── common.ts
│   │   ├── player.ts
│   │   ├── result.ts
│   │   └── tournament.ts
│   ├── utils/            # Utility functions
│   │   ├── errors.ts
│   │   └── pagination.ts
│   ├── app.ts            # Fastify app builder
│   └── index.ts          # Server entry point
├── tests/                # Test files
├── package.json
└── tsconfig.json
```

## Testing

```bash
# Run tests
pnpm --filter rest-api test

# Run tests in watch mode
pnpm --filter rest-api test:watch

# Run tests with coverage
pnpm --filter rest-api test:coverage
```

Tests use `@testcontainers/postgresql` for integration testing with a real PostgreSQL database.

## Technology Stack

- **[Fastify](https://fastify.dev/)** - High-performance web framework
- **[@fastify/jwt](https://github.com/fastify/fastify-jwt)** - JWT authentication
- **[@fastify/swagger](https://github.com/fastify/fastify-swagger)** - OpenAPI specification
- **[@fastify/swagger-ui](https://github.com/fastify/fastify-swagger-ui)** - Swagger UI
- **[@fastify/cors](https://github.com/fastify/fastify-cors)** - CORS support
- **[Prisma](https://www.prisma.io/)** - Database ORM (via @opprs/db-prisma)
- **[Vitest](https://vitest.dev/)** - Testing framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety

## License

MIT License - see LICENSE file for details.
