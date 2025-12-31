# Getting Started

This guide will help you set up and run the complete OPPRS stack: REST API, web frontend, and PostgreSQL database.

## Prerequisites

- Node.js 18+ (Node.js 22+ recommended for frontend)
- PostgreSQL database
- pnpm (recommended) or npm
- Docker and Docker Compose (optional, for containerized deployment)

## Quick Start with Docker Compose

The fastest way to run the entire stack:

```bash
# Clone the repository
git clone https://github.com/themcaffee/OPPR.git
cd OPPR

# Start all services
docker compose up
```

This will start:
- **PostgreSQL** database on port 5432
- **REST API** on http://localhost:3000
- **Frontend** on http://localhost:3001

## Manual Setup

### 1. Install Dependencies

From the repository root:

```bash
pnpm install
```

### 2. Set Up the Database

Generate the Prisma client and run migrations:

```bash
pnpm --filter @opprs/db-prisma run db:generate
pnpm --filter @opprs/db-prisma run db:migrate
```

Set the `DATABASE_URL` environment variable:

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/opprs"
```

### 3. Configure Environment Variables

Create `.env` files for the services that need them:

**For REST API** (`apps/rest-api/.env`):

```bash
# Server
HOST=0.0.0.0
PORT=3000
LOG_LEVEL=info

# JWT Authentication
JWT_SECRET=your-secure-secret-key
JWT_REFRESH_SECRET=your-secure-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/opprs
```

### 4. Start the Services

**Start the REST API:**

```bash
pnpm --filter rest-api dev
```

The API will be available at http://localhost:3000 with interactive docs at http://localhost:3000/docs

**Start the Frontend:**

```bash
pnpm --filter frontend-next dev
```

The web app will be available at http://localhost:3001

## Testing Your Setup

### Test the REST API

```bash
# Health check
curl http://localhost:3000/health

# Get system stats (requires authentication)
curl http://localhost:3000/api/v1/stats/overview \
  -H "Authorization: Bearer <your-token>"
```

### Access the Frontend

Open http://localhost:3001 in your browser to see the web interface.

### Explore the API Docs

Visit http://localhost:3000/docs to see the interactive Swagger UI documentation.

## Seed Data (Optional)

Load sample data for testing:

```bash
pnpm --filter @opprs/db-prisma run db:seed
```

## What's Next?

### For Application Development
- Explore the [REST API](/rest-api) documentation for endpoint details
- Learn about the [Frontend](/frontend-next) architecture and components
- Understand the [Database](/db-prisma) schema and queries

### For Library Integration
- Install the core library: `npm install @opprs/core`
- Learn about [Core Concepts](/core-concepts) behind the calculations
- Customize behavior with [Configuration](/configuration)
- Browse the complete [API Reference](/api-reference)

## Using the Core Library

If you want to use just the calculation engine in your own application:

```bash
npm install @opprs/core
```

Example usage:

```typescript
import {
  calculateBaseValue,
  calculateTotalTVA,
  calculateTGP,
  distributePoints,
  type Player,
  type TGPConfig,
} from '@opprs/core';

const players: Player[] = [
  { id: '1', rating: 1800, ranking: 1, isRated: true },
  { id: '2', rating: 1700, ranking: 5, isRated: true },
];

const baseValue = calculateBaseValue(players);
const { totalTVA } = calculateTotalTVA(players);

const tgpConfig: TGPConfig = {
  qualifying: { type: 'limited', meaningfulGames: 7 },
  finals: { formatType: 'match-play', meaningfulGames: 12 },
};

const tgp = calculateTGP(tgpConfig);
const firstPlaceValue = (baseValue + totalTVA) * tgp;

console.log(`Tournament first place value: ${firstPlaceValue.toFixed(2)} points`);
```

See the [Core Concepts](/core-concepts) guide for detailed calculation documentation.
