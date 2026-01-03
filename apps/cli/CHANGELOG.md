# @opprs/cli

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
