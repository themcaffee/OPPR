---
"frontend-next": minor
"rest-api": minor
"@opprs/rest-api-client": minor
"@opprs/db-prisma": minor
---

Add admin user edit page with role management, player linking, and password reset

- Add dedicated user edit page at /admin/users/[id]
- Admins can change user roles, link/unlink player profiles, and reset passwords
- Replaces inline modal approach with consistent edit page pattern
- Add findUserByPlayerId function to db-prisma
- Expand PATCH /users/:id endpoint to handle full user updates
- Add UpdateUserRequest type and update method to API client
