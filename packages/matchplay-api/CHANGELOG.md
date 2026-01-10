# @opprs/matchplay-api

## 3.1.0

### Minor Changes

- 0b17169: Add getStandings() method to expose raw tournament standings with player names

## 3.0.0

### Patch Changes

- af4b6cf: Fix API response format handling for several endpoints:
  - Fix standings endpoint to handle plain array response instead of `{ data: [...] }`
  - Fix users endpoint to handle `{ user, rating, ifpa, userCounts }` response structure
  - Fix searchPlayers to use correct `query` parameter instead of `q`
  - Remove broken `getTournamentStats()` and `getTournamentPlayerStats()` methods that used non-existent API endpoints
- Updated dependencies [3a435d6]
  - @opprs/core@3.0.0

## 2.2.1

### Patch Changes

- 57ba139: Update minimum Node.js version requirement from 18.0.0 to 20.9.0 to align with current dependency requirements (Next.js 15, Vitest 4, Prisma 6)
- Updated dependencies [57ba139]
  - @opprs/core@2.2.1

## 1.0.0

### Patch Changes

- Updated dependencies [05fc34c]
  - @opprs/core@1.0.0
