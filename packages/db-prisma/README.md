# @opprs/db-prisma

PostgreSQL persistence layer for the Open Pinball Player Ranking System (OPPRS) using Prisma ORM.

## Installation

```bash
pnpm add @opprs/db-prisma @prisma/client
```

## Quick Start

### 1. Configure database connection

```bash
# Set DATABASE_URL in your environment
DATABASE_URL="postgresql://user:password@localhost:5432/opprs?schema=public"
```

### 2. Generate Prisma client and run migrations

```bash
pnpm --filter @opprs/db-prisma run db:generate
pnpm --filter @opprs/db-prisma run db:migrate
```

### 3. Use in your code

```typescript
import {
  prisma,
  createPlayer,
  createTournament,
  createResult,
  getPlayerStats,
} from '@opprs/db-prisma';

// Create a player
const player = await createPlayer({
  name: 'Alice Champion',
  email: 'alice@example.com',
  rating: 1500,
  isRated: true,
});

// Create a tournament and record results
const tournament = await createTournament({
  name: 'Spring Championship 2024',
  date: new Date('2024-03-15'),
  location: 'Portland, OR',
  eventBooster: 'CERTIFIED',
  tgpConfig: {
    qualifying: { type: 'limited', meaningfulGames: 7 },
    finals: { formatType: 'match-play', meaningfulGames: 15, fourPlayerGroups: true },
  },
});

await createResult({
  playerId: player.id,
  tournamentId: tournament.id,
  position: 1,
  totalPoints: 87.5,
});

// Get player statistics
const stats = await getPlayerStats(player.id);
```

## Features

- **PostgreSQL + Prisma ORM** - Type-safe database queries and migrations
- **Query Helpers** - High-level functions for players, tournaments, and results
- **Time Decay** - Automatic point depreciation calculations
- **Player Statistics** - Comprehensive performance metrics
- **Seed Data** - Sample data for development and testing

## Documentation

For complete API reference, database schema, and integration examples, see the [Database (Prisma) documentation](../../docs/db-prisma.md).

Full documentation site: [OPPRS Documentation](https://thatguyinabeanie.github.io/OPPR/)

## License

MIT
