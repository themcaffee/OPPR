---
"@opprs/db-prisma": minor
"rest-api": minor
---

Add API key authentication for programmatic API access

- New `ApiKey` database model with support for optional expiration dates and usage tracking
- REST endpoints for managing API keys: create, list, get, and delete
- API key authentication via `X-API-Key` header or `Authorization: Bearer opprs_...`
- Maximum of 5 API keys per user
- Keys inherit permissions from the owning user
