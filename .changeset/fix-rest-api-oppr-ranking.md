---
"rest-api": patch
"@opprs/db-prisma": patch
---

Fix REST API player endpoints to work with new OpprPlayerRanking model

- Update POST /players to create OpprPlayerRanking when rating fields are provided
- Update PATCH /players/:id to handle rating data in the separate OpprPlayerRanking model
- Update GET endpoints to include and merge ranking data in responses
- Add isRated filter support for GET /players via opprRanking relation
