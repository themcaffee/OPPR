---
"frontend-next": patch
"@opprs/db-prisma": patch
---

Add comprehensive e2e tests for player dashboard

- Add 23 new Playwright e2e tests for the dashboard page
- Test authentication, leaderboard interactions, player profile cards, and navigation
- Create test user with linked player profile in database seed
- Make seed file idempotent using upsert operations
- Update CI workflow to seed database for e2e tests
- Update existing auth and login tests to use seeded test user
# Trigger CI
