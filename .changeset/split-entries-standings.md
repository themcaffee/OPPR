---
"@opprs/db-prisma": minor
"@opprs/rest-api-client": minor
"rest-api": minor
"frontend-next": patch
"@opprs/cli": patch
---

feat: Split tournament results into Round, Match, Entry, and Standing models

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
