---
"rest-api": minor
"frontend-next": minor
"@opprs/rest-api-client": minor
"@opprs/db-prisma": minor
---

feat: add admin page with full CRUD for all models

- Add admin authorization middleware to REST API
- Create user management endpoints (list, get, update role, delete)
- Apply admin-only protection to write operations (players, tournaments, results)
- Add Users resource to rest-api-client
- Add findUsers function to db-prisma
- Create Next.js middleware for admin route protection
- Add admin dashboard with stats overview
- Add admin pages for Players, Tournaments, Results, and Users management
- Include reusable admin components (DataTable, Pagination, SearchInput, Modal, ConfirmDialog)
