# frontend-next

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
