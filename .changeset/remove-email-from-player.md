---
"@opprs/db-prisma": major
"@opprs/rest-api-client": major
"rest-api": minor
"frontend-next": patch
"@opprs/cli": patch
---

Remove email field from Player model

BREAKING CHANGE: The `email` field has been removed from the Player model. Email now only exists on the User model. Players and Users are linked via a one-to-one relationship.

- Removed `email` field and `@@index([email])` from Player schema
- Replaced `findPlayerByEmail()` with `findPlayerByUserEmail()` to find players through their linked User account
- Updated `searchPlayers()` to search by name only (previously searched name and email)
- Updated `createUserWithPlayer()` to no longer accept email in player data
- Removed email from all Player-related API schemas and TypeScript types
- Removed email column from admin player list and email field from player edit form
- Removed `--email` option from CLI player commands
