---
"@opprs/core": patch
"@opprs/rest-api-client": patch
"@opprs/cli": patch
---

Remove unused exports and deprecated methods

- Remove unused `GroupSize` type export from @opprs/core
- Remove deprecated `updateRole()` method from @opprs/rest-api-client (use `update()` instead)
- Update @opprs/cli to use `update()` instead of deprecated `updateRole()`
