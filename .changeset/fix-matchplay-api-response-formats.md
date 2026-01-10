---
"@opprs/matchplay-api": patch
---

Fix API response format handling for several endpoints:
- Fix standings endpoint to handle plain array response instead of `{ data: [...] }`
- Fix users endpoint to handle `{ user, rating, ifpa, userCounts }` response structure
- Fix searchPlayers to use correct `query` parameter instead of `q`
- Remove broken `getTournamentStats()` and `getTournamentPlayerStats()` methods that used non-existent API endpoints
