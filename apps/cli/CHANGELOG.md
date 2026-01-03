# @opprs/cli

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
