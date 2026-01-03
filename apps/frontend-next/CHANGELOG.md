# frontend-next

## 2.0.1

### Patch Changes

- 4a78048: Fix TypeError on dashboard page when user or player profile is undefined

## 2.0.0

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

## 1.3.0

### Minor Changes

- f64a12d: Add player dashboard landing page with personal stats, leaderboards, and activity feed

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
  - @opprs/rest-api-client@1.2.0

## 1.1.4

### Patch Changes

- Updated dependencies [b75d627]
  - @opprs/core@1.1.4

## 1.1.3

### Patch Changes

- Updated dependencies [9623514]
  - @opprs/core@1.1.3

## 1.1.2

### Patch Changes

- Updated dependencies [35a4242]
  - @opprs/core@1.1.2

## 1.1.1

### Patch Changes

- c26cd97: Trigger Docker image publishing from changesets release workflow instead of GitHub release events. Stable Docker images are now only built when npm packages are actually published.

## 1.1.0

### Minor Changes

- 95ea87d: Add authentication integration to frontend
  - Connect registration form to backend API with name, email, and password fields
  - Connect sign-in form to backend API with error handling
  - Add logout button to profile page
  - Create API client singleton with cookie-based authentication
  - Add profile page for post-registration redirect

## 1.0.0

### Patch Changes

- Updated dependencies [05fc34c]
  - @opprs/core@1.0.0
