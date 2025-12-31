# oppr-db

Database backend for [OPPR (Open Pinball Player Ranking System)](https://github.com/themcaffee/OPPR) using Prisma and PostgreSQL.

This library provides a complete database solution for storing and querying OPPR data including players, tournaments, and tournament results with full TypeScript support.

## Features

- **PostgreSQL Database** - Production-ready relational database
- **Prisma ORM** - Type-safe database queries and migrations
- **Full TypeScript Support** - Complete type safety and IntelliSense
- **Query Helpers** - High-level functions for common operations
- **Seed Data** - Sample data for development and testing
- **Time Decay Calculations** - Automatic point depreciation over time
- **Player Statistics** - Comprehensive player performance metrics
- **Tournament Management** - Complete tournament and result tracking

## Installation

```bash
npm install oppr-db @prisma/client
```

For TypeScript projects, also install:

```bash
npm install -D prisma
```

## Quick Start

### 1. Set up your database

Create a PostgreSQL database and set the connection URL in your environment:

```bash
# Copy the example env file
cp node_modules/oppr-db/.env.example .env

# Edit .env and set your DATABASE_URL
DATABASE_URL="postgresql://user:password@localhost:5432/oppr_db?schema=public"
```

### 2. Run migrations

```bash
npx prisma migrate deploy
```

### 3. (Optional) Seed sample data

```bash
npx prisma db seed
```

### 4. Use in your code

```typescript
import {
  prisma,
  createPlayer,
  createTournament,
  createResult,
  getPlayerStats,
} from 'oppr-db';

// Create a player
const player = await createPlayer({
  name: 'Alice Champion',
  email: 'alice@example.com',
  rating: 1500,
  isRated: true,
});

// Create a tournament
const tournament = await createTournament({
  name: 'Spring Championship 2024',
  date: new Date('2024-03-15'),
  location: 'Portland, OR',
  eventBooster: 'CERTIFIED',
  tgpConfig: {
    qualifying: {
      type: 'limited',
      meaningfulGames: 7,
    },
    finals: {
      formatType: 'match-play',
      meaningfulGames: 15,
      fourPlayerGroups: true,
    },
  },
});

// Record a result
await createResult({
  playerId: player.id,
  tournamentId: tournament.id,
  position: 1,
  totalPoints: 87.5,
});

// Get player statistics
const stats = await getPlayerStats(player.id);
console.log(stats);
```

## API Reference

### Database Client

```typescript
import { prisma, connect, disconnect, testConnection } from 'oppr-db';

// The Prisma client (singleton)
prisma.player.findMany();

// Test connection
const isConnected = await testConnection();

// Manual connection management (usually not needed)
await connect();
await disconnect();
```

### Player Functions

```typescript
import {
  createPlayer,
  findPlayerById,
  findPlayerByEmail,
  findPlayers,
  updatePlayer,
  updatePlayerRating,
  getTopPlayersByRating,
  getTopPlayersByRanking,
  getPlayerWithResults,
  getPlayerStats,
  searchPlayers,
} from 'oppr-db';

// Create a player
const player = await createPlayer({
  name: 'Bob Wizard',
  email: 'bob@example.com',
  rating: 1600,
  ratingDeviation: 75,
  ranking: 25,
  isRated: true,
  eventCount: 12,
});

// Find by ID or email
const found = await findPlayerById(player.id);
const byEmail = await findPlayerByEmail('bob@example.com');

// Get top players
const topRated = await getTopPlayersByRating(50);
const topRanked = await getTopPlayersByRanking(50);

// Update rating after tournament
await updatePlayerRating(player.id, 1650, 70, 13);

// Get player with all results
const withResults = await getPlayerWithResults(player.id);

// Get statistics
const stats = await getPlayerStats(player.id);
// Returns: { totalEvents, totalPoints, averagePosition, firstPlaceFinishes, ... }

// Search players
const results = await searchPlayers('bob');
```

### Tournament Functions

```typescript
import {
  createTournament,
  findTournamentById,
  getTournamentWithResults,
  getRecentTournaments,
  getMajorTournaments,
  getTournamentsByDateRange,
  searchTournaments,
  getTournamentStats,
} from 'oppr-db';

// Create a tournament
const tournament = await createTournament({
  name: 'World Championship 2024',
  location: 'Las Vegas, NV',
  date: new Date('2024-06-01'),
  eventBooster: 'MAJOR',
  tgpConfig: {
    qualifying: {
      type: 'limited',
      meaningfulGames: 12,
      fourPlayerGroups: true,
    },
    finals: {
      formatType: 'match-play',
      meaningfulGames: 20,
      fourPlayerGroups: true,
    },
  },
  firstPlaceValue: 500.0,
});

// Get recent tournaments
const recent = await getRecentTournaments(20);

// Get major tournaments
const majors = await getMajorTournaments();

// Get tournaments by date range
const inRange = await getTournamentsByDateRange(
  new Date('2024-01-01'),
  new Date('2024-12-31'),
);

// Get tournament with all results
const withResults = await getTournamentWithResults(tournament.id);

// Get statistics
const stats = await getTournamentStats(tournament.id);
```

### Tournament Result Functions

```typescript
import {
  createResult,
  createManyResults,
  getPlayerResults,
  getTournamentResults,
  getPlayerTopFinishes,
  updateResultPoints,
  recalculateTimeDecay,
} from 'oppr-db';

// Create a single result
await createResult({
  playerId: player.id,
  tournamentId: tournament.id,
  position: 1,
  totalPoints: 500.0,
  linearPoints: 50.0,
  dynamicPoints: 450.0,
});

// Create multiple results at once
await createManyResults([
  { playerId: player1.id, tournamentId: tournament.id, position: 1, totalPoints: 500 },
  { playerId: player2.id, tournamentId: tournament.id, position: 2, totalPoints: 350 },
  { playerId: player3.id, tournamentId: tournament.id, position: 3, totalPoints: 250 },
]);

// Get all results for a player
const playerResults = await getPlayerResults(player.id);

// Get all results for a tournament
const tournamentResults = await getTournamentResults(tournament.id);

// Get player's top 15 finishes
const topFinishes = await getPlayerTopFinishes(player.id, 15);

// Recalculate time decay for all results
await recalculateTimeDecay();
```

## Database Schema

### Player Table

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier (CUID) |
| `externalId` | String? | External ID from OPPR or other systems |
| `name` | String? | Player name |
| `email` | String? | Player email (unique) |
| `rating` | Float | Glicko rating (default: 1300) |
| `ratingDeviation` | Float | Rating uncertainty (default: 200) |
| `ranking` | Int? | World ranking position |
| `isRated` | Boolean | Has 5+ events |
| `eventCount` | Int | Number of events participated |

### Tournament Table

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier (CUID) |
| `externalId` | String? | External ID from OPPR or other systems |
| `name` | String | Tournament name |
| `location` | String? | Tournament location |
| `date` | DateTime | Tournament date |
| `tgpConfig` | Json | TGP configuration object |
| `eventBooster` | Enum | Event booster type |
| `firstPlaceValue` | Float? | Calculated first place value |

### TournamentResult Table

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier (CUID) |
| `playerId` | String | Reference to player |
| `tournamentId` | String | Reference to tournament |
| `position` | Int | Finishing position |
| `totalPoints` | Float? | Total points awarded |
| `decayedPoints` | Float? | Points after time decay |
| `efficiency` | Float? | Performance efficiency |

## Development

### Prerequisites

- Node.js 18+
- PostgreSQL 12+

### Setup

```bash
# Clone the repository
git clone https://github.com/themcaffee/oppr-db.git
cd oppr-db

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed the database
npm run db:seed
```

### Scripts

```bash
# Development
npm run dev          # Watch mode for development
npm run build        # Build for production
npm run typecheck    # Type check without emitting

# Database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations (dev)
npm run db:push      # Push schema without migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset database (WARNING: deletes all data)

# Code quality
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

## Integration with OPPR

This library complements the [OPPR](https://github.com/themcaffee/OPPR) library by providing database persistence:

```typescript
import {
  calculateBaseValue,
  calculateTGP,
  distributePoints,
  type Player as OPPRPlayer,
} from '@opprs/core';
import {
  createTournament,
  createManyResults,
  type CreateTournamentInput,
} from 'oppr-db';

// Use OPPR to calculate tournament values
const players: OPPRPlayer[] = [...]; // Your players
const baseValue = calculateBaseValue(players);
const tgp = calculateTGP(tgpConfig);
const firstPlaceValue = baseValue * tgp;
const distributions = distributePoints(results, firstPlaceValue);

// Store in database
const tournament = await createTournament({
  name: 'My Tournament',
  date: new Date(),
  tgpConfig,
  baseValue,
  tgp,
  firstPlaceValue,
});

// Store results
await createManyResults(
  distributions.map(d => ({
    playerId: d.player.id,
    tournamentId: tournament.id,
    position: d.position,
    totalPoints: d.totalPoints,
    linearPoints: d.linearPoints,
    dynamicPoints: d.dynamicPoints,
  }))
);
```

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please ensure all tests pass and maintain the existing code style.

## Acknowledgments

Built as a complementary database layer for the [OPPR](https://github.com/themcaffee/OPPR) ranking system.
