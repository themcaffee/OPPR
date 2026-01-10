---
"@opprs/db-prisma": major
---

Remove Entry, Match, and Round database models

BREAKING CHANGE: This removes the following from the public API:
- `Entry`, `Match`, `Round` Prisma models
- `MatchResult` enum
- All entry, match, and round query functions
- `getTournamentWithMatches` function

Tournament results now only track final standings via the Standing model.
