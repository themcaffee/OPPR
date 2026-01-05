# frontend-next

## 2.5.0

### Minor Changes

- 4754a06: Add blog system with TipTap WYSIWYG editor
  - Add BlogPost and BlogTag database models with draft/published workflow
  - Add REST API endpoints for blog posts and tags
  - Add API client resources for blog posts and tags
  - Add TipTap WYSIWYG editor component for admin post editing
  - Add admin pages for managing blog posts and tags
  - Add public blog listing and detail pages with tag filtering
  - Support featured images, excerpts, and SEO fields

- 9b5fc07: Add policy acceptance to user registration
  - Add Terms of Service, Privacy Policy, and Code of Conduct acceptance tracking
  - New DateTime fields on User model: tosAcceptedAt, privacyPolicyAcceptedAt, codeOfConductAcceptedAt
  - Registration form requires acceptPolicies checkbox
  - New public pages: /terms, /privacy, /code-of-conduct
  - Footer links to policy pages

### Patch Changes

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

## 2.4.0

### Minor Changes

- 1f87e18: Remove standalone players page and consolidate search into rankings page
  - Added search functionality to the rankings page that searches all players (both rated and unrated)
  - Removed the `/players` page (player profile pages at `/players/[id]` still work)
  - Removed "Players" link from header navigation
  - Updated player profile back links to point to `/rankings`

## 2.3.0

### Patch Changes

- 2db0cbb: Add unit tests and e2e tests for the /players page and player profile page

## 2.2.1

### Patch Changes

- Updated dependencies [57ba139]
  - @opprs/core@2.2.1
  - @opprs/rest-api-client@2.2.1

## 2.2.0

### Minor Changes

- 4e2906b: Add public landing page for non-signed-in users
  - Non-authenticated users can now access a public landing page at `/` showing leaderboard preview and recent tournaments
  - Add public pages for browsing rankings (`/rankings`), tournaments (`/tournaments`, `/tournaments/[id]`), and players (`/players`, `/players/[id]`)
  - Make API GET endpoints for players, tournaments, and stats publicly accessible without authentication
  - Protected routes (`/dashboard`, `/admin`) still require authentication

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

### Patch Changes

- Updated dependencies [aa1a8c6]
  - @opprs/rest-api-client@2.1.0

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
