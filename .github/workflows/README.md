# GitHub Actions Workflows

This directory contains CI/CD workflows for the OPPR project.

## Workflows

### CI (`ci.yml`)
Runs on every push and pull request:
- Linting
- Type checking
- Unit tests
- Build verification

### Publish Docker Image (`docker-publish.yml`)
Publishes Docker images to GitHub Container Registry:
- **Canary builds**: On every push to `main` (tagged as `version-canary.sha`)
- **Stable builds**: On release creation (tagged as `version` and `latest`)

Images:
- `ghcr.io/[owner]/oppr-rest-api`
- `ghcr.io/[owner]/oppr-frontend`

### Deploy to GitHub Pages (`deploy.yml`)
Deploys documentation and demo app to GitHub Pages:
- Runs on every push to `main`
- Deploys VitePress docs and demo app

### Release (`release.yml`)
Handles versioning and npm publishing via changesets:
- Creates "Version Packages" PR when changesets are present
- Publishes packages to npm when the PR is merged
- Publishes stable Docker images after release
