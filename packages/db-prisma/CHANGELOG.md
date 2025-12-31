# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.1](https://github.com/themcaffee/OPPR/compare/v0.5.0...v0.5.1) (2025-12-31)


### Bug Fixes

* **ci:** sync package versions and fix release-please config ([#22](https://github.com/themcaffee/OPPR/issues/22)) ([36ddb60](https://github.com/themcaffee/OPPR/commit/36ddb60ef94e0e1d92675b09793f96cdfb31f480))

## [0.1.0] - 2024-12-29

### Added

- Initial release of oppr-db
- PostgreSQL database schema with Prisma ORM
- Player model with rating, ranking, and event tracking
- Tournament model with TGP configuration support
- TournamentResult model linking players to tournaments
- Complete TypeScript type definitions
- Database client singleton with connection management
- Query helper functions for players, tournaments, and results
- Player statistics calculation
- Tournament statistics calculation
- Time decay calculation and recalculation utilities
- Seed data script with sample players and tournaments
- Comprehensive documentation and API reference
- Migration guide for database schema management
- ESLint and Prettier configuration
- Full npm package configuration

### Database Schema

- `Player` table with Glicko rating system support
- `Tournament` table with event booster types and TGP configuration
- `TournamentResult` junction table with point tracking and decay
- Indexes for performance optimization
- Cascading deletes for data integrity

### API Functions

#### Player Functions
- `createPlayer`, `updatePlayer`, `deletePlayer`
- `findPlayerById`, `findPlayerByEmail`, `findPlayerByExternalId`
- `getRatedPlayers`, `getTopPlayersByRating`, `getTopPlayersByRanking`
- `getPlayerWithResults`, `getPlayerStats`
- `searchPlayers`, `updatePlayerRating`

#### Tournament Functions
- `createTournament`, `updateTournament`, `deleteTournament`
- `findTournamentById`, `findTournamentByExternalId`
- `getRecentTournaments`, `getMajorTournaments`
- `getTournamentsByDateRange`, `getTournamentsByBoosterType`
- `getTournamentWithResults`, `getTournamentStats`
- `searchTournaments`

#### Result Functions
- `createResult`, `createManyResults`
- `updateResult`, `deleteResult`
- `getPlayerResults`, `getTournamentResults`
- `getPlayerTopFinishes`, `getPlayerStats`
- `recalculateTimeDecay`, `updateResultPoints`

[0.1.0]: https://github.com/themcaffee/oppr-db/releases/tag/v0.1.0
