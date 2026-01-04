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
- `rest-api` - REST API application
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

## Adding a New Package or App

This monorepo uses pnpm workspaces with Turborepo. New code can be added as either a **package** (reusable library) or an **app** (standalone application).

### Directory Structure

- `packages/` - Reusable libraries (e.g., @opprs/core, @opprs/db-prisma)
- `apps/` - Standalone applications (e.g., demo, rest-api)

### Step 1: Create the Directory

```bash
# For a package (library)
mkdir -p packages/my-package/src packages/my-package/tests

# For an app (application)
mkdir -p apps/my-app/src apps/my-app/tests
```

### Step 2: Create package.json

**For a published package:**

```json
{
  "name": "@opprs/my-package",
  "version": "0.5.2",
  "description": "Description of your package",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist", "README.md", "LICENSE"],
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts --clean",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src tests",
    "lint:fix": "eslint src tests --fix",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist coverage .turbo",
    "prepublishOnly": "pnpm run typecheck && pnpm run lint && pnpm run test && pnpm run build"
  },
  "devDependencies": {
    "@types/node": "^22.10.5",
    "@vitest/coverage-v8": "^4.0.16",
    "tsup": "^8.3.5",
    "typescript": "^5.7.2",
    "vitest": "^4.0.16"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**For an internal app:**

```json
{
  "name": "my-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -b",
    "start": "node dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src tests",
    "lint:fix": "eslint src tests --fix",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist coverage .turbo"
  },
  "dependencies": {
    "@opprs/core": "workspace:*",
    "@opprs/db-prisma": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^22.10.5",
    "@vitest/coverage-v8": "^4.0.16",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2",
    "vitest": "^4.0.16"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Step 3: Create tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": false,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### Step 4: Create vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        'src/index.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

### Step 5: Create ESLint Configuration (Optional)

For Node.js apps/packages that need console logging, create `eslint.config.js`:

```javascript
import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  eslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        process: 'readonly',
        console: 'readonly',
        globalThis: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'off',
      'no-unused-vars': 'off',
    },
  },
  {
    ignores: ['node_modules/', 'dist/', 'coverage/'],
  },
];
```

### Step 6: Create Source Files

Create your entry point at `src/index.ts` and add your code.

### Step 7: Install Dependencies

```bash
pnpm install
```

### Step 8: Verify Setup

```bash
# Replace 'my-app' with your package/app name
pnpm --filter my-app run build
pnpm --filter my-app run test
pnpm --filter my-app run lint
pnpm --filter my-app run typecheck
```

### Dependency Management

- **Apps**: Use `workspace:*` for monorepo dependencies
- **Packages**: Use `workspace:^` for monorepo dependencies (allows version ranges)

### Checklist

Before submitting:

- [ ] `package.json` has correct name, version, and scripts
- [ ] `tsconfig.json` is configured correctly
- [ ] `vitest.config.ts` has appropriate coverage thresholds
- [ ] `src/index.ts` exports the public API
- [ ] Tests exist in `tests/` directory
- [ ] All commands pass: build, test, lint, typecheck

## Release Process

This project uses [Changesets](https://github.com/changesets/changesets) for versioning and changelog generation.

### Adding a Changeset

When making user-facing changes, add a changeset:

```bash
pnpm changeset
```

This launches an interactive prompt where you:
1. Select affected packages
2. Choose bump type (patch/minor/major)
3. Write a summary of the changes

This creates a markdown file in `.changeset/` that should be committed with your PR.

### How Releases Work

1. PRs with changesets merge to `main`
2. CI automatically creates/updates a "Version Packages" PR with:
   - Version bumps based on changesets
   - Updated CHANGELOGs
3. When the "Version Packages" PR is merged:
   - Git tags are created
   - Packages are automatically published to npm

## Questions?

If you have questions, feel free to open an issue for discussion.
