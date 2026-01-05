# @opprs/cli

## 1.1.5

### Patch Changes

- Updated dependencies [4bd4fa2]
  - @opprs/rest-api-client@2.6.0

## 1.1.4

### Patch Changes

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

- Updated dependencies [4754a06]
- Updated dependencies [9b5fc07]
- Updated dependencies [b943669]
  - @opprs/rest-api-client@2.5.0

## 1.1.3

### Patch Changes

- Updated dependencies [57ba139]
  - @opprs/rest-api-client@2.2.1

## 1.1.2

### Patch Changes

- Updated dependencies [aa1a8c6]
  - @opprs/rest-api-client@2.1.0

## 1.1.1

### Patch Changes

- df3625a: Remove email field from Player model

  BREAKING CHANGE: The `email` field has been removed from the Player model. Email now only exists on the User model. Players and Users are linked via a one-to-one relationship.
  - Removed `email` field and `@@index([email])` from Player schema
  - Replaced `findPlayerByEmail()` with `findPlayerByUserEmail()` to find players through their linked User account
  - Updated `searchPlayers()` to search by name only (previously searched name and email)
  - Updated `createUserWithPlayer()` to no longer accept email in player data
  - Removed email from all Player-related API schemas and TypeScript types
  - Removed email column from admin player list and email field from player edit form
  - Removed `--email` option from CLI player commands

- Updated dependencies [df3625a]
  - @opprs/rest-api-client@2.0.0

## 1.1.0

### Minor Changes

- 0ba2f7d: Add CLI application with full REST API support
  - Authentication commands: login, logout, whoami, register with token storage in ~/.opprs/config.json
  - Players commands: list, get, search, create, update, delete, results, stats, top-rating, top-ranking
  - Tournaments commands: list, get, search, create, update, delete, results, stats, recent, majors
  - Results commands: list, get, create, batch-create, update, delete, recalculate-decay
  - Stats commands: overview, leaderboard
  - Import commands: matchplay tournament import
  - Users commands: admin user management (list, get, update, delete)
  - Global options: --api-url, --json output, --no-color
