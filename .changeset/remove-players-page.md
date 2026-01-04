---
"frontend-next": minor
---

Remove standalone players page and consolidate search into rankings page

- Added search functionality to the rankings page that searches all players (both rated and unrated)
- Removed the `/players` page (player profile pages at `/players/[id]` still work)
- Removed "Players" link from header navigation
- Updated player profile back links to point to `/rankings`
