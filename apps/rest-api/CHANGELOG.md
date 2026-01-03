# rest-api

## 2.0.0

### Minor Changes

- df3625a: Remove email field from Player model

  BREAKING CHANGE: The `email` field has been removed from the Player model. Email now only exists on the User model. Players and Users are linked via a one-to-one relationship.
  - Removed `email` field and `@@index([email])` from Player schema
  - Replaced `findPlayerByEmail()` with `findPlayerByUserEmail()` to find players through their linked User account
  - Updated `searchPlayers()` to search by name only (previously searched name and email)
  - Updated `createUserWithPlayer()` to no longer accept email in player data
  - Removed email from all Player-related API schemas and TypeScript types
  - Removed email column from admin player list and email field from player edit form
  - Removed `--email` option from CLI player commands

### Patch Changes

- Updated dependencies [df3625a]
  - @opprs/db-prisma@2.0.0

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

### Patch Changes

- Updated dependencies [e403a1b]
  - @opprs/db-prisma@1.2.0

## 1.1.5

### Patch Changes

- Updated dependencies [bed085b]
  - @opprs/db-prisma@1.1.5

## 1.1.4

### Patch Changes

- Updated dependencies [b75d627]
  - @opprs/core@1.1.4
  - @opprs/matchplay-api@1.0.0

## 1.1.3

### Patch Changes

- Updated dependencies [9623514]
  - @opprs/core@1.1.3
  - @opprs/matchplay-api@1.0.0

## 1.1.2

### Patch Changes

- Updated dependencies [35a4242]
  - @opprs/core@1.1.2
  - @opprs/matchplay-api@1.0.0

## 1.1.1

### Patch Changes

- c26cd97: Trigger Docker image publishing from changesets release workflow instead of GitHub release events. Stable Docker images are now only built when npm packages are actually published.

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
- Updated dependencies [3bf48f4]
  - @opprs/core@1.0.0
  - @opprs/db-prisma@1.0.0
  - @opprs/matchplay-api@1.0.0
