# Contributing to OPPRS

Thank you for your interest in contributing to OPPRS! This document provides guidelines and information for contributors.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/OPPR.git`
3. Install dependencies: `pnpm install`
4. Create a branch: `git checkout -b feat/your-feature`

## Development

### Prerequisites

- Node.js 20+
- pnpm 9+

### Common Commands

```bash
pnpm install          # Install dependencies
pnpm run build        # Build all packages
pnpm run test         # Run all tests
pnpm run lint         # Lint all packages
pnpm run format       # Format code with Prettier
pnpm run typecheck    # Type check all packages
```

### Code Style

- ESLint and Prettier are configured for consistent code style
- Run `pnpm run lint:fix` and `pnpm run format` before committing
- TypeScript strict mode is enabled

## Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for automatic versioning. Your commit messages must follow this format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description | Version Bump |
|------|-------------|--------------|
| `feat` | New feature | Minor (0.X.0) |
| `fix` | Bug fix | Patch (0.0.X) |
| `docs` | Documentation only | None |
| `style` | Code style (formatting, semicolons, etc.) | None |
| `refactor` | Code refactoring | None |
| `perf` | Performance improvement | None |
| `test` | Adding or updating tests | None |
| `build` | Build system or dependencies | None |
| `ci` | CI/CD configuration | None |
| `chore` | Other changes | None |

### Scopes

Use package names as scopes when changes are specific to a package:

- `core` - @opprs/core package
- `db-prisma` - @opprs/db-prisma package
- `demo` - Demo application
- `docs` - Documentation

### Breaking Changes

For breaking changes, add `!` after the type or include `BREAKING CHANGE:` in the footer:

```bash
feat!: remove deprecated API endpoints

# or

feat: update authentication flow

BREAKING CHANGE: JWT tokens now expire after 1 hour instead of 24 hours
```

Breaking changes trigger a major version bump (X.0.0).

### Examples

```bash
feat(core): add new rating decay calculation
fix(db-prisma): correct query ordering in tournament results
docs: update API reference for TVA functions
refactor: simplify point distribution logic
test(core): add tests for edge cases in TGP calculation
```

## Pull Requests

1. Ensure all tests pass: `pnpm run test`
2. Ensure code is formatted: `pnpm run format`
3. Ensure linting passes: `pnpm run lint`
4. Ensure types check: `pnpm run typecheck`
5. Use a descriptive PR title following conventional commit format
6. Reference any related issues in the PR description

## Release Process

Releases are automated using [release-please](https://github.com/googleapis/release-please):

1. Commits to `main` are analyzed for conventional commit messages
2. release-please automatically creates/updates a Release PR with:
   - Version bumps based on commit types
   - Updated CHANGELOGs
3. When the Release PR is merged:
   - A new git tag is created
   - A GitHub Release is published
   - Packages are automatically published to npm

You don't need to manually update version numbers or CHANGELOGs - just write good commit messages!

## Questions?

If you have questions, feel free to open an issue for discussion.
