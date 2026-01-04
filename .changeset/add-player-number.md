---
"@opprs/db-prisma": minor
---

Add unique 5-digit `playerNumber` field to Player model for stable player identification. Player numbers are auto-generated on creation and range from 10000-99999. Includes new `findPlayerByPlayerNumber()` lookup function and `generateUniquePlayerNumber()` / `isValidPlayerNumber()` utilities.
