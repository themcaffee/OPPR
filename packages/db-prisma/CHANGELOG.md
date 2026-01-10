# Changelog

## 3.0.0

### Major Changes

- e9f4d2b: Remove Entry, Match, and Round database models

  BREAKING CHANGE: This removes the following from the public API:
  - `Entry`, `Match`, `Round` Prisma models
  - `MatchResult` enum
  - All entry, match, and round query functions
  - `getTournamentWithMatches` function

  Tournament results now only track final standings via the Standing model.

### Patch Changes

- Updated dependencies [3a435d6]
  - @opprs/core@3.0.0

## 2.6.0

### Minor Changes

- 4bd4fa2: Add qualifyingFormat field to Tournament model for specifying tournament qualifying format type (single-elimination, double-elimination, match-play, etc.)

### Patch Changes

- 93558b4: Add optional externalUrl field to Tournament model for linking to external tournament pages

## 2.5.0

### Minor Changes

- cd8b178: Add API key authentication for programmatic API access
  - New `ApiKey` database model with support for optional expiration dates and usage tracking
  - REST endpoints for managing API keys: create, list, get, and delete
  - API key authentication via `X-API-Key` header or `Authorization: Bearer opprs_...`
  - Maximum of 5 API keys per user
  - Keys inherit permissions from the owning user

- 4754a06: Add blog system with TipTap WYSIWYG editor
  - Add BlogPost and BlogTag database models with draft/published workflow
  - Add REST API endpoints for blog posts and tags
  - Add API client resources for blog posts and tags
  - Add TipTap WYSIWYG editor component for admin post editing
  - Add admin pages for managing blog posts and tags
  - Add public blog listing and detail pages with tag filtering
  - Support featured images, excerpts, and SEO fields

- 5b08a34: Separate OPPR rankings and ratings into dedicated models
  - Add `OpprPlayerRanking` model to store OPPR-specific rating and ranking data
  - Add `OpprRankingHistory` model to track rating/ranking changes over time
  - Remove rating fields (`rating`, `ratingDeviation`, `ranking`, `isRated`, `lastRatingUpdate`) from `Player` model
  - Add new query helpers for OPPR ranking operations:
    - `getOrCreateOpprPlayerRanking`
    - `findOpprPlayerRankingByPlayerId`
    - `getTopPlayersByOpprRating`
    - `getTopPlayersByOpprRanking`
    - `getRatedOpprPlayers`
    - `updateOpprRatingAfterTournament`
    - `updateWorldRankings`
    - `getOpprRankingHistory`
  - Migration includes data migration from Player to OpprPlayerRanking

  This change enables future extensibility for alternative ranking systems.

- 9b5fc07: Add policy acceptance to user registration
  - Add Terms of Service, Privacy Policy, and Code of Conduct acceptance tracking
  - New DateTime fields on User model: tosAcceptedAt, privacyPolicyAcceptedAt, codeOfConductAcceptedAt
  - Registration form requires acceptPolicies checkbox
  - New public pages: /terms, /privacy, /code-of-conduct
  - Footer links to policy pages

- b943669: feat: Split tournament results into Round, Match, Entry, and Standing models

  This is a major schema refactoring that replaces the flat `TournamentResult` model with a hierarchical structure for tracking tournament matches and results:
  - **Round** - Groups matches within a stage (e.g., "Round 1", "Quarterfinals") with `isFinals` flag
  - **Match** - A single game with 1-4 players, optionally belonging to a Round
  - **Entry** - A player's participation in a match (records WIN/LOSS/TIE outcome)
  - **Standing** - Final position for qualifying or finals standings

  Key changes:
  - New Prisma models: Round, Match, Entry, Standing, MatchResult enum
  - New REST API endpoints: `/standings`, `/rounds`, `/matches`, `/entries`
  - Updated matchplay import service to create full tournament structure
  - Players can appear in both qualifying AND finals standings for the same tournament
  - Points are calculated using "merged standings" (finalists use finals position, non-finalists use qualifying position)

### Patch Changes

- 5b08a34: Fix REST API player endpoints to work with new OpprPlayerRanking model
  - Update POST /players to create OpprPlayerRanking when rating fields are provided
  - Update PATCH /players/:id to handle rating data in the separate OpprPlayerRanking model
  - Update GET endpoints to include and merge ranking data in responses
  - Add isRated filter support for GET /players via opprRanking relation

## 2.3.0

### Minor Changes

- 0840995: Add unique 5-digit `playerNumber` field to Player model for stable player identification. Player numbers are auto-generated on creation and range from 10000-99999. Includes new `findPlayerByPlayerNumber()` lookup function and `generateUniquePlayerNumber()` / `isValidPlayerNumber()` utilities.

## 2.2.1

### Patch Changes

- 57ba139: Update minimum Node.js version requirement from 18.0.0 to 20.9.0 to align with current dependency requirements (Next.js 15, Vitest 4, Prisma 6)
- Updated dependencies [57ba139]
  - @opprs/core@2.2.1

## 2.2.0

### Patch Changes

- 3610ef6: Add comprehensive e2e tests for player dashboard
  - Add 23 new Playwright e2e tests for the dashboard page
  - Test authentication, leaderboard interactions, player profile cards, and navigation
  - Create test user with linked player profile in database seed
  - Make seed file idempotent using upsert operations
  - Update CI workflow to seed database for e2e tests
  - Update existing auth and login tests to use seeded test user

  # Trigger CI

## 2.1.0

### Minor Changes

- aa1a8c6: Add admin user edit page with role management, player linking, and password reset
  - Add dedicated user edit page at /admin/users/[id]
  - Admins can change user roles, link/unlink player profiles, and reset passwords
  - Replaces inline modal approach with consistent edit page pattern
  - Add findUserByPlayerId function to db-prisma
  - Expand PATCH /users/:id endpoint to handle full user updates
  - Add UpdateUserRequest type and update method to API client

## 2.0.0

### Major Changes

- df3625a: Remove email field from Player model

  BREAKING CHANGE: The `email` field has been removed from the Player model. Email now only exists on the User model. Players and Users are linked via a one-to-one relationship.
  - Removed `email` field and `@@index([email])` from Player schema
  - Replaced `findPlayerByEmail()` with `findPlayerByUserEmail()` to find players through their linked User account
  - Updated `searchPlayers()` to search by name only (previously searched name and email)
  - Updated `createUserWithPlayer()` to no longer accept email in player data
  - Removed email from all Player-related API schemas and TypeScript types
  - Removed email column from admin player list and email field from player edit form
  - Removed `--email` option from CLI player commands

## 1.2.0

### Minor Changes

- e403a1b: feat: add admin page with full CRUD for all models
  - Add admin authorization middleware to REST API
  - Create user management endpoints (list, get, update role, delete)
  - Apply admin-only protection to write operations (players, tournaments, results)
  - Add Users resource to rest-api-client
  - Add findUsers function to db-prisma
  - Create Next.js middleware for admin route protection
  - Add admin dashboard with stats overview
  - Add admin pages for Players, Tournaments, Results, and Users management
  - Include reusable admin components (DataTable, Pagination, SearchInput, Modal, ConfirmDialog)

## 1.1.5

### Patch Changes

- bed085b: Add explicit database migrations to release workflow that run before deployment

## 1.0.0

### Minor Changes

- 3bf48f4: Add user registration API with cookie-based authentication
  - Add User model with role-based access and Player linking
  - Add registration endpoint that creates user with linked player profile
  - Support HTTP-only cookie authentication alongside token-based auth
  - Add cookie mode to REST API client with `useCookies` option
  - Add `register()` method to REST API client

### Patch Changes

- Updated dependencies [05fc34c]
  - @opprs/core@1.0.0

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0](https://github.com/themcaffee/OPPR/compare/v0.6.0...v0.7.0) (2026-01-02)

### Features

- **rest-api:** add Docker support with PostgreSQL and migrations ([#37](https://github.com/themcaffee/OPPR/issues/37)) ([6782466](https://github.com/themcaffee/OPPR/commit/6782466a6113ecfe43125befd210ba5effcc2343))

### Bug Fixes

- **ci:** release-please publish workflow and docs cleanup ([#27](https://github.com/themcaffee/OPPR/issues/27)) ([ab2c746](https://github.com/themcaffee/OPPR/commit/ab2c74606067d51d1b64c7422d5cf61acde6013c))
- **ci:** sync package versions and fix release-please config ([#22](https://github.com/themcaffee/OPPR/issues/22)) ([36ddb60](https://github.com/themcaffee/OPPR/commit/36ddb60ef94e0e1d92675b09793f96cdfb31f480))

## [0.6.0](https://github.com/themcaffee/OPPR/compare/v0.5.2...v0.6.0) (2025-12-31)

### Features

- **rest-api:** add Docker support with PostgreSQL and migrations ([#37](https://github.com/themcaffee/OPPR/issues/37)) ([6782466](https://github.com/themcaffee/OPPR/commit/6782466a6113ecfe43125befd210ba5effcc2343))

## [0.5.2](https://github.com/themcaffee/OPPR/compare/v0.5.1...v0.5.2) (2025-12-31)

### Bug Fixes

- **ci:** release-please publish workflow and docs cleanup ([#27](https://github.com/themcaffee/OPPR/issues/27)) ([ab2c746](https://github.com/themcaffee/OPPR/commit/ab2c74606067d51d1b64c7422d5cf61acde6013c))

## [0.5.1](https://github.com/themcaffee/OPPR/compare/v0.5.0...v0.5.1) (2025-12-31)

### Bug Fixes

- **ci:** sync package versions and fix release-please config ([#22](https://github.com/themcaffee/OPPR/issues/22)) ([36ddb60](https://github.com/themcaffee/OPPR/commit/36ddb60ef94e0e1d92675b09793f96cdfb31f480))

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
