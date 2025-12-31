# REST API

The OPPRS REST API provides a complete HTTP interface for managing players, tournaments, results, and rankings. Built with [Fastify](https://fastify.dev/) and secured with JWT authentication.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm

### Installation

From the monorepo root:

```bash
# Install dependencies
pnpm install

# Generate Prisma client and run migrations
pnpm --filter @opprs/db-prisma run db:generate
pnpm --filter @opprs/db-prisma run db:migrate
```

### Running the Server

```bash
# Development (with hot reload)
pnpm --filter rest-api dev

# Production
pnpm --filter rest-api build
pnpm --filter rest-api start
```

The API will be available at `http://localhost:3000`.

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Most endpoints require a valid access token.

### Login Flow

1. **Get tokens** by posting credentials to `/api/v1/auth/login`:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

Response:
```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "expiresIn": 900,
  "tokenType": "Bearer"
}
```

2. **Use the access token** in subsequent requests:

```bash
curl http://localhost:3000/api/v1/players \
  -H "Authorization: Bearer eyJhbG..."
```

3. **Refresh the token** when it expires using `/api/v1/auth/refresh`

4. **Logout** by revoking the refresh token via `/api/v1/auth/logout`

## API Resources

The API provides full CRUD operations for all resources under `/api/v1`:

| Resource | Base Path | Description |
|----------|-----------|-------------|
| Players | `/api/v1/players` | Player profiles, ratings, rankings, stats |
| Tournaments | `/api/v1/tournaments` | Tournament data, TGP, TVA, event boosters |
| Results | `/api/v1/results` | Tournament results, points, time decay |
| Stats | `/api/v1/stats` | System overview, leaderboards |

All list endpoints support:
- **Pagination**: `?page=1&limit=20`
- **Sorting**: `?sortBy=rating&sortOrder=desc`
- **Filtering**: Resource-specific query parameters

## OpenAPI Documentation

Full interactive API documentation is available via Swagger UI:

```
http://localhost:3000/docs
```

The Swagger UI provides:
- Complete endpoint reference with request/response schemas
- Try-it-out functionality for testing endpoints
- Authentication support for protected routes

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `0.0.0.0` | Server host |
| `PORT` | `3000` | Server port |
| `LOG_LEVEL` | `info` | Log level |
| `JWT_SECRET` | - | Access token secret |
| `JWT_REFRESH_SECRET` | - | Refresh token secret |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token TTL |
| `DATABASE_URL` | - | PostgreSQL connection string |

::: warning
Always set secure values for `JWT_SECRET` and `JWT_REFRESH_SECRET` in production.
:::

## Development

### Testing

```bash
pnpm --filter rest-api test
pnpm --filter rest-api test:coverage
```

### Project Structure

See the [REST API README](https://github.com/themcaffee/OPPR/tree/main/apps/rest-api) for the full project structure and technology stack.
