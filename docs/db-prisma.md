# Database (Prisma)

`@opprs/db-prisma` is the PostgreSQL persistence layer for OPPRS, built with [Prisma ORM](https://www.prisma.io/). It provides query helpers for storing and retrieving players, tournaments, and results.

## Installation

```bash
pnpm add @opprs/db-prisma
```

The package has a peer dependency on `@opprs/core`:

```bash
pnpm add @opprs/core @opprs/db-prisma
```

## Setup

### 1. Configure Database Connection

Set the `DATABASE_URL` environment variable:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/opprs?schema=public"
```

### 2. Generate Prisma Client

```bash
pnpm --filter @opprs/db-prisma run db:generate
```

### 3. Run Migrations

```bash
pnpm --filter @opprs/db-prisma run db:migrate
```

### 4. (Optional) Seed Sample Data

```bash
pnpm --filter @opprs/db-prisma run db:seed
```

### 5. (Optional) Open Prisma Studio

```bash
pnpm --filter @opprs/db-prisma run db:studio
```

## Migrations

Prisma Migrate is a declarative database migration system that generates SQL migration files from your Prisma schema changes, applies them to your database, and tracks migration history.

### Development Workflow

#### Making Schema Changes

1. Edit the Prisma schema in `packages/db-prisma/prisma/schema.prisma`

2. Create and apply the migration:

```bash
pnpm --filter @opprs/db-prisma exec prisma migrate dev --name describe_your_change
```

Examples:
```bash
pnpm --filter @opprs/db-prisma exec prisma migrate dev --name add_player_location
pnpm --filter @opprs/db-prisma exec prisma migrate dev --name update_tournament_fields
```

#### Viewing Migration Status

Check which migrations have been applied:

```bash
pnpm --filter @opprs/db-prisma exec prisma migrate status
```

#### Resetting the Database

WARNING: This deletes all data!

```bash
pnpm --filter @opprs/db-prisma exec prisma migrate reset
```

This will drop the database, create a new one, apply all migrations, and run seed scripts if configured.

### Production Deployment

In production, use `migrate deploy` instead of `migrate dev`:

```bash
npx prisma migrate deploy
```

This only applies pending migrations, does not create new migrations, and is safe for production use.

#### Example CI/CD Pipeline

```yaml
# Example GitHub Actions workflow
deploy:
  steps:
    - name: Install dependencies
      run: pnpm install

    - name: Run migrations
      run: npx prisma migrate deploy
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}

    - name: Deploy application
      run: pnpm run deploy
```

### Common Commands

```bash
# Generate Prisma Client after schema changes
pnpm --filter @opprs/db-prisma run db:generate

# Create and apply a new migration (development)
pnpm --filter @opprs/db-prisma exec prisma migrate dev --name migration_name

# Apply pending migrations (production)
npx prisma migrate deploy

# Check migration status
pnpm --filter @opprs/db-prisma exec prisma migrate status

# Reset database (WARNING: deletes data)
pnpm --filter @opprs/db-prisma exec prisma migrate reset

# Push schema changes without migrations (prototyping only)
pnpm --filter @opprs/db-prisma exec prisma db push

# Open Prisma Studio (database GUI)
pnpm --filter @opprs/db-prisma run db:studio

# Seed the database
pnpm --filter @opprs/db-prisma run db:seed
```

### Migration Files

Migrations are stored in `packages/db-prisma/prisma/migrations/` directory:

```
prisma/
  migrations/
    20240315120000_init/
      migration.sql
    20240320140000_add_player_location/
      migration.sql
    migration_lock.toml
```

Each migration contains a timestamp prefix for ordering, a descriptive name, and a SQL file with migration commands.

### Troubleshooting

#### Migration Failed

If a migration fails:

1. Check the error message
2. Fix the issue (database constraints, etc.)
3. Try again or use `migrate resolve`:

```bash
npx prisma migrate resolve --applied migration_name
```

#### Schema Drift Detected

If Prisma detects differences between your schema and database:

```bash
# In development
pnpm --filter @opprs/db-prisma exec prisma migrate dev

# To sync without migrations (not recommended for production)
pnpm --filter @opprs/db-prisma exec prisma db push
```

### Best Practices

1. **Always version control migrations** - Commit migration files to git and never edit applied migrations

2. **Test migrations before production** - Run on staging environment first and verify data integrity

3. **Use descriptive migration names** - `add_player_email` is good, `update_schema` is not

4. **Backup before major migrations** - Always backup production data and test rollback procedures

5. **Use `migrate deploy` in production** - Never use `migrate dev` or `db push` in production

6. **Keep schema changes small** - One logical change per migration makes rollback easier

## Schema Overview

The database schema consists of three main models:

### Player

Represents a pinball player with Glicko rating information.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Primary key (CUID) |
| `externalId` | String? | External system reference |
| `name` | String? | Player name |
| `rating` | Float | Glicko rating (default: 1500) |
| `ratingDeviation` | Float | Rating uncertainty (default: 200) |
| `ranking` | Int? | World ranking position |
| `isRated` | Boolean | True if 5+ events (default: false) |
| `eventCount` | Int | Tournament participation count (default: 0) |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |
| `lastRatingUpdate` | DateTime? | Last rating calculation |
| `lastEventDate` | DateTime? | Most recent tournament |

### Tournament

Represents a pinball tournament event.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Primary key (CUID) |
| `externalId` | String? | External reference |
| `name` | String | Tournament name |
| `location` | String? | Physical location |
| `date` | DateTime | Event date |
| `tgpConfig` | Json? | TGP configuration from @opprs/core |
| `eventBooster` | EventBoosterType | Event classification |
| `allowsOptOut` | Boolean | Player opt-out policy (default: false) |
| `baseValue` | Float? | Calculated base value |
| `tvaRating` | Float? | TVA from ratings |
| `tvaRanking` | Float? | TVA from rankings |
| `totalTVA` | Float? | Combined TVA |
| `tgp` | Float? | Tournament Grading Percentage |
| `eventBoosterMultiplier` | Float? | Multiplier (1.0x-2.0x) |
| `firstPlaceValue` | Float? | First place points |

### TournamentResult

Junction table linking players to tournaments with point distribution.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Primary key (CUID) |
| `playerId` | String | Reference to Player |
| `tournamentId` | String | Reference to Tournament |
| `position` | Int | Finishing placement (1 = first) |
| `optedOut` | Boolean | Opted out of ranking (default: false) |
| `linearPoints` | Float? | Linear allocation (10%) |
| `dynamicPoints` | Float? | Dynamic allocation (90%) |
| `totalPoints` | Float? | Sum of linear + dynamic |
| `ageInDays` | Int? | Days since tournament |
| `decayMultiplier` | Float? | Decay factor (1.0, 0.75, 0.5, or 0.0) |
| `decayedPoints` | Float? | totalPoints x decayMultiplier |
| `efficiency` | Float? | Performance efficiency percentage |

### EventBoosterType

Enum for tournament classification:

| Value | Description |
|-------|-------------|
| `NONE` | Standard tournament |
| `CERTIFIED` | Certified event |
| `CERTIFIED_PLUS` | Certified Plus event |
| `CHAMPIONSHIP_SERIES` | Championship series event |
| `MAJOR` | Major tournament |

## API Reference

### Database Client

```typescript
import { prisma, connect, disconnect, testConnection } from '@opprs/db-prisma';
```

| Function | Description |
|----------|-------------|
| `prisma` | Singleton PrismaClient instance |
| `connect()` | Manual connection (usually not needed) |
| `disconnect()` | Graceful shutdown |
| `testConnection()` | Test DB connectivity, returns boolean |

### Player Functions

```typescript
import {
  createPlayer,
  updatePlayer,
  updatePlayerRating,
  deletePlayer,
  findPlayerById,
  findPlayerByExternalId,
  findPlayerByUserEmail,
  findPlayers,
  getRatedPlayers,
  getTopPlayersByRating,
  getTopPlayersByRanking,
  getPlayerWithResults,
  getPlayerStats,
  searchPlayers,
  countPlayers,
} from '@opprs/db-prisma';
```

#### Create & Update

| Function | Description |
|----------|-------------|
| `createPlayer(data)` | Create a new player |
| `updatePlayer(id, data)` | Update player fields |
| `updatePlayerRating(id, rating, ratingDeviation, eventCount?)` | Update rating after tournament |
| `deletePlayer(id)` | Delete player (cascades to results) |

#### Find & Query

| Function | Description |
|----------|-------------|
| `findPlayerById(id, include?)` | Get by primary key |
| `findPlayerByExternalId(externalId, include?)` | Get by external reference |
| `findPlayerByUserEmail(email, include?)` | Get player through linked User's email |
| `findPlayers(options?)` | Query with filters, pagination, ordering |
| `getRatedPlayers(options?)` | Get players where isRated = true |
| `getTopPlayersByRating(limit?)` | Top players by rating (default: 50) |
| `getTopPlayersByRanking(limit?)` | Top players by ranking (default: 50) |
| `getPlayerWithResults(id)` | Player with all tournament results |
| `getPlayerStats(playerId)` | Aggregate statistics |
| `searchPlayers(query, limit?)` | Case-insensitive name search |
| `countPlayers(where?)` | Count matching players |

### Tournament Functions

```typescript
import {
  createTournament,
  updateTournament,
  deleteTournament,
  findTournamentById,
  findTournamentByExternalId,
  findTournaments,
  getRecentTournaments,
  getTournamentsByDateRange,
  getTournamentsByBoosterType,
  getMajorTournaments,
  getTournamentWithResults,
  getTournamentStats,
  searchTournaments,
  countTournaments,
} from '@opprs/db-prisma';
```

#### Create & Update

| Function | Description |
|----------|-------------|
| `createTournament(data)` | Create a tournament |
| `updateTournament(id, data)` | Update tournament fields |
| `deleteTournament(id)` | Delete tournament (cascades to results) |

#### Find & Query

| Function | Description |
|----------|-------------|
| `findTournamentById(id, include?)` | Get by primary key |
| `findTournamentByExternalId(externalId, include?)` | Get by external reference |
| `findTournaments(options?)` | Query with filters, pagination, ordering |
| `getRecentTournaments(limit?, include?)` | Latest tournaments (default: 20) |
| `getTournamentsByDateRange(startDate, endDate, options?)` | Filter by date range |
| `getTournamentsByBoosterType(boosterType, options?)` | Filter by event classification |
| `getMajorTournaments(limit?)` | Get major tournaments only |
| `getTournamentWithResults(id)` | Tournament with all results and players |
| `getTournamentStats(id)` | Aggregate statistics |
| `searchTournaments(query, limit?)` | Case-insensitive name/location search |
| `countTournaments(where?)` | Count matching tournaments |

### Result Functions

```typescript
import {
  createResult,
  createManyResults,
  updateResult,
  updateResultPoints,
  deleteResult,
  deleteResultsByTournament,
  findResultById,
  findResultByPlayerAndTournament,
  findResults,
  getPlayerResults,
  getTournamentResults,
  getPlayerTopFinishes,
  getPlayerStats,
  countResults,
  recalculateTimeDecay,
} from '@opprs/db-prisma';
```

#### Create & Update

| Function | Description |
|----------|-------------|
| `createResult(data)` | Create a single result |
| `createManyResults(data[])` | Batch insert results |
| `updateResult(id, data)` | Update result fields |
| `updateResultPoints(id, linear, dynamic, total)` | Update points and auto-calculate decay |
| `deleteResult(id)` | Delete single result |
| `deleteResultsByTournament(tournamentId)` | Delete all results for a tournament |

#### Find & Query

| Function | Description |
|----------|-------------|
| `findResultById(id, include?)` | Get by primary key |
| `findResultByPlayerAndTournament(playerId, tournamentId, include?)` | Get by composite key |
| `findResults(options?)` | Query with filters, pagination, ordering |
| `getPlayerResults(playerId, options?)` | All results for a player |
| `getTournamentResults(tournamentId, options?)` | All results for a tournament |
| `getPlayerTopFinishes(playerId, limit?)` | Top N results by decayed points |
| `getPlayerStats(playerId)` | Player aggregate statistics |
| `countResults(where?)` | Count matching results |

#### Time Decay

| Function | Description |
|----------|-------------|
| `recalculateTimeDecay(referenceDate?)` | Batch recalculate all decay multipliers |

Time decay rules:
- 0-1 years: 100% (multiplier 1.0)
- 1-2 years: 75% (multiplier 0.75)
- 2-3 years: 50% (multiplier 0.5)
- 3+ years: 0% (multiplier 0.0)

## Integration with @opprs/core

The typical workflow uses `@opprs/core` for calculations and `@opprs/db-prisma` for storage:

```typescript
import {
  calculateBaseValue,
  calculateRatingTVA,
  calculateRankingTVA,
  calculateTGP,
  getEventBoosterMultiplier,
  distributePoints,
} from '@opprs/core';

import {
  createTournament,
  createManyResults,
  findPlayers,
} from '@opprs/db-prisma';

// 1. Get players from database
const players = await findPlayers({ where: { isRated: true } });

// 2. Calculate tournament values using @opprs/core
const baseValue = calculateBaseValue(players);
const ratingTVA = calculateRatingTVA(players);
const rankingTVA = calculateRankingTVA(players);
const tgp = calculateTGP(tgpConfig);
const eventBooster = getEventBoosterMultiplier('certified');
const firstPlaceValue = (baseValue + ratingTVA + rankingTVA) * tgp * eventBooster;

// 3. Store tournament with calculated values
const tournament = await createTournament({
  name: 'Weekly Tournament',
  date: new Date(),
  tgpConfig,
  eventBooster: 'CERTIFIED',
  baseValue,
  tvaRating: ratingTVA,
  tvaRanking: rankingTVA,
  tgp,
  eventBoosterMultiplier: eventBooster,
  firstPlaceValue,
});

// 4. Calculate and store point distributions
const results = [
  { player: players[0], position: 1 },
  { player: players[1], position: 2 },
  { player: players[2], position: 3 },
];

const distributions = distributePoints(results, firstPlaceValue);

await createManyResults(
  distributions.map((d) => ({
    playerId: d.player.id,
    tournamentId: tournament.id,
    position: d.position,
    linearPoints: d.linearPoints,
    dynamicPoints: d.dynamicPoints,
    totalPoints: d.totalPoints,
  }))
);
```

## Type Exports

```typescript
import type {
  Player,
  Tournament,
  TournamentResult,
  EventBoosterType,
  PlayerWithResults,
  TournamentResultWithTournament,
  PlayerStatistics,
  TournamentStatistics,
  ConnectionStatus,
  Prisma,
} from '@opprs/db-prisma';
```

| Type | Description |
|------|-------------|
| `Player` | Prisma Player model |
| `Tournament` | Prisma Tournament model |
| `TournamentResult` | Prisma TournamentResult model |
| `EventBoosterType` | Event classification enum |
| `PlayerWithResults` | Player with results array and stats |
| `TournamentResultWithTournament` | Result with nested tournament |
| `PlayerStatistics` | Aggregate player stats |
| `TournamentStatistics` | Aggregate tournament stats |
| `ConnectionStatus` | Database connection status |
| `Prisma` | Prisma namespace for advanced queries |
