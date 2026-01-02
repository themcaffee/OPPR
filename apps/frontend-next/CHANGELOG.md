# frontend-next

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
