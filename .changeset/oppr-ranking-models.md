---
"@opprs/db-prisma": minor
---

Separate OPPR rankings and ratings into dedicated models

- Add `OpprPlayerRanking` model to store OPPR-specific rating and ranking data
- Add `OpprRankingHistory` model to track rating/ranking changes over time
- Remove rating fields (`rating`, `ratingDeviation`, `ranking`, `isRated`, `lastRatingUpdate`) from `Player` model
- Add new query helpers for OPPR ranking operations:
  - `getOrCreateOpprPlayerRanking`
  - `findOpprPlayerRankingByPlayerId`
  - `getTopPlayersByOpprRating`
  - `getTopPlayersByOpprRanking`
  - `getRatedOpprPlayers`
  - `updateOpprRatingAfterTournament`
  - `updateWorldRankings`
  - `getOpprRankingHistory`
- Migration includes data migration from Player to OpprPlayerRanking

This change enables future extensibility for alternative ranking systems.
