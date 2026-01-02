---
"rest-api": patch
"frontend-next": patch
---

Trigger Docker image publishing from changesets release workflow instead of GitHub release events. Stable Docker images are now only built when npm packages are actually published.
