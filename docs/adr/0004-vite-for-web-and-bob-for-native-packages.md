# ADR-0004: Use Vite for the Web package and Builder Bob for the Native package

- Status: Accepted
- Date: 2026-08-23

## Context

The Web package must publish ESM, Tailwind CSS v4 output, declarations, and source maps. The Native package must publish React Native source, an ESM fallback, declarations, CSS assets for Uniwind, and source maps. Both tarballs must exclude private hosts, stories, tests, and fixtures.

A single generic TypeScript bundler would be convenient, but current candidates either do not own CSS, have experimental CSS support, are no longer actively maintained, or require unnecessary first-version configuration.

## Decision

### Web

- Use Vite library mode with the official Tailwind CSS Vite plugin to produce ESM, a stable CSS file, and JavaScript source maps.
- Use `tsc --emitDeclarationOnly` with a build-specific TypeScript config for declarations and declaration maps.
- Externalize React, React DOM, React Aria Components, and their subpaths.
- Publish a files allowlist containing only the Web distribution directory.

### Native

- Use React Native Builder Bob with the ESM module and TypeScript targets.
- Publish React Native source plus Bob's ESM, declarations, copied CSS assets, and source maps.
- Use the `react-native` export condition for published source and ESM as the non-Metro fallback.
- Exclude stories, tests, fixtures, and mocks through Bob, the build TypeScript config, and the package files allowlist.

### Shared package contract

- Publish ESM only in V1. Add CommonJS only if a verified consumer requires it.
- Maintain exports explicitly rather than generating them dynamically.
- ADR-0003 remains authoritative: V1 exposes only the package root and `./styles`; it does not add a `./package.json` subpath.
- Inspect pack manifests, run Publint, install real tarballs in outside-workspace fixtures, and verify the build twice from a clean state.

## Consequences

- Web and Native use different build tools suited to their platform contracts.
- Vite does not generate declarations, so Web has two explicit build steps.
- Native tarballs include source for Metro and require stricter negative file checks.
- tsdown can be reconsidered when its CSS support is stable; tsup, direct Rollup, and tsc-only builds are not V1 choices.
- Tool versions and export-condition behavior must be rechecked against current releases at implementation time.
