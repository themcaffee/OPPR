# @opprs/rest-api-client

## 2.2.1

### Patch Changes

- 57ba139: Update minimum Node.js version requirement from 18.0.0 to 20.9.0 to align with current dependency requirements (Next.js 15, Vitest 4, Prisma 6)

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

## 1.0.0

### Minor Changes

- 3bf48f4: Add user registration API with cookie-based authentication
  - Add User model with role-based access and Player linking
  - Add registration endpoint that creates user with linked player profile
  - Support HTTP-only cookie authentication alongside token-based auth
  - Add cookie mode to REST API client with `useCookies` option
  - Add `register()` method to REST API client
