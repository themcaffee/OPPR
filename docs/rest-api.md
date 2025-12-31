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

## Example Workflows

### Creating a Tournament

```bash
# 1. Login to get access token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'

# 2. Create a tournament
curl -X POST http://localhost:3000/api/v1/tournaments \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer Championships 2024",
    "date": "2024-08-15T00:00:00Z",
    "location": "Seattle, WA",
    "tgpConfig": {
      "qualifying": {
        "type": "limited",
        "meaningfulGames": 7
      },
      "finals": {
        "formatType": "match-play",
        "meaningfulGames": 12,
        "fourPlayerGroups": true
      }
    },
    "eventBooster": "major"
  }'
```

### Adding Tournament Results

```bash
# Batch create results for a tournament
curl -X POST http://localhost:3000/api/v1/results/batch \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "tournamentId": "tournament-uuid",
    "results": [
      {"playerId": "player-1-uuid", "position": 1},
      {"playerId": "player-2-uuid", "position": 2},
      {"playerId": "player-3-uuid", "position": 3}
    ]
  }'
```

### Searching Players

```bash
# Search players by name
curl "http://localhost:3000/api/v1/players?search=John&page=1&limit=10" \
  -H "Authorization: Bearer <access_token>"

# Get top 10 players by rating
curl "http://localhost:3000/api/v1/players?sortBy=rating&sortOrder=desc&limit=10" \
  -H "Authorization: Bearer <access_token>"
```

### Viewing Leaderboards

```bash
# Top players by world ranking
curl "http://localhost:3000/api/v1/stats/leaderboard?type=ranking&limit=50" \
  -H "Authorization: Bearer <access_token>"

# Top players by rating
curl "http://localhost:3000/api/v1/stats/leaderboard?type=rating&limit=50" \
  -H "Authorization: Bearer <access_token>"
```

## Common Use Cases

### Tournament Management System

The REST API is ideal for building tournament management applications:

1. **Player Registration** - Create and manage player profiles
2. **Tournament Creation** - Define tournament formats with TGP configuration
3. **Results Entry** - Enter tournament results and automatically calculate points
4. **Leaderboards** - Display current rankings and ratings
5. **Player Stats** - Show individual player statistics and history

### Integration with Existing Systems

Use the API to integrate OPPRS calculations into existing tournament software:

- Import player data via POST `/api/v1/players`
- Submit tournament results via POST `/api/v1/results/batch`
- Retrieve updated rankings via GET `/api/v1/stats/leaderboard`
- Export player data for external use

### Mobile App Backend

The REST API provides all endpoints needed for a mobile tournament app:

- JWT authentication for secure user sessions
- CRUD operations for offline-first sync
- Pagination for efficient data loading
- Search and filtering for player/tournament lookup

## Development

### Testing

```bash
# Run all tests
pnpm --filter rest-api test

# Run tests in watch mode
pnpm --filter rest-api test:watch

# Generate coverage report
pnpm --filter rest-api test:coverage
```

### Code Quality

```bash
# Lint code
pnpm --filter rest-api lint

# Auto-fix linting issues
pnpm --filter rest-api lint:fix

# Type check
pnpm --filter rest-api typecheck
```

### Project Structure

```
apps/rest-api/
├── src/
│   ├── config/           # Environment and Swagger configuration
│   ├── middleware/       # Error handling middleware
│   ├── plugins/          # Fastify plugins (auth, CORS, database, Swagger)
│   ├── routes/           # API route handlers (v1/auth, players, tournaments, etc.)
│   ├── schemas/          # JSON Schema definitions for validation
│   ├── utils/            # Utility functions (errors, pagination)
│   ├── app.ts            # Fastify app builder
│   └── index.ts          # Server entry point
├── tests/                # Integration tests with testcontainers
├── .env                  # Environment variables
└── package.json
```

For more details, see the [REST API README](https://github.com/themcaffee/OPPR/tree/main/apps/rest-api).
