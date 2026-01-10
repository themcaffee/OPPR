# Changelog

## 3.0.0

### Patch Changes

- 3a435d6: Remove unused exports and deprecated methods
  - Remove unused `GroupSize` type export from @opprs/core
  - Remove deprecated `updateRole()` method from @opprs/rest-api-client (use `update()` instead)
  - Update @opprs/cli to use `update()` instead of deprecated `updateRole()`

## 2.2.1

### Patch Changes

- 57ba139: Update minimum Node.js version requirement from 18.0.0 to 20.9.0 to align with current dependency requirements (Next.js 15, Vitest 4, Prisma 6)

## 1.1.4

### Patch Changes

- b75d627: chore: final test of Docker publish on release

## 1.1.3

### Patch Changes

- 9623514: chore: verify Docker publish on release commits

## 1.1.2

### Patch Changes

- 35a4242: chore: test Docker publish on release commits

## 1.0.0

### Minor Changes

- 05fc34c: Sync version to match linked packages after migration from release-please to changesets

## [0.5.3](https://github.com/themcaffee/OPPR/compare/v0.5.2...v0.5.3) (2025-12-31)

### Bug Fixes

- **ci:** sync manifest and package versions to 0.5.2 ([#30](https://github.com/themcaffee/OPPR/issues/30)) ([3ec9d29](https://github.com/themcaffee/OPPR/commit/3ec9d294be0794c8460a3bdb8cc271e08def82d9))

## [0.5.2](https://github.com/themcaffee/OPPR/compare/v0.5.1...v0.5.2) (2025-12-31)

### Bug Fixes

- **ci:** release-please publish workflow and docs cleanup ([#27](https://github.com/themcaffee/OPPR/issues/27)) ([ab2c746](https://github.com/themcaffee/OPPR/commit/ab2c74606067d51d1b64c7422d5cf61acde6013c))

## [0.5.1](https://github.com/themcaffee/OPPR/compare/v0.5.0...v0.5.1) (2025-12-31)

### Documentation

- **core:** simplify README and use OPPRS naming ([#23](https://github.com/themcaffee/OPPR/issues/23)) ([d9363f5](https://github.com/themcaffee/OPPR/commit/d9363f5315433e9e01c0d67b6e9506326a007aa8))

## [0.5.0](https://github.com/themcaffee/OPPR/compare/v0.4.1...v0.5.0) (2025-12-31)

### Features

- **ci:** add automatic versioning with release-please ([#20](https://github.com/themcaffee/OPPR/issues/20)) ([882c53d](https://github.com/themcaffee/OPPR/commit/882c53dcb8dd363129824428752976a0babb6838))

## Changelog

All notable changes to @opprs/core will be documented in this file.
