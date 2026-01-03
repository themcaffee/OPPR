---
"frontend-next": minor
"rest-api": minor
---

Add public landing page for non-signed-in users

- Non-authenticated users can now access a public landing page at `/` showing leaderboard preview and recent tournaments
- Add public pages for browsing rankings (`/rankings`), tournaments (`/tournaments`, `/tournaments/[id]`), and players (`/players`, `/players/[id]`)
- Make API GET endpoints for players, tournaments, and stats publicly accessible without authentication
- Protected routes (`/dashboard`, `/admin`) still require authentication
