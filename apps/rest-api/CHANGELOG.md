# rest-api

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
