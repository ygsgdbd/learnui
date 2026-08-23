# ADR-0003: Define the external consumer contract with tarball fixtures

- Status: Accepted
- Date: 2026-08-23

## Context

LearnUI is developed in a monorepo, but its Web and Native component packages are intended to be installable by unrelated applications. Workspace links, source aliases, broad source scanning, and hoisted dependencies can hide missing exports, undeclared peers, duplicate runtimes, and absent styles.

The packages also need a small public surface and an installation process that does not mutate consumer projects.

## Decision

### Peer dependencies

- `@learnui/web` peers: React, React DOM, React Aria Components, and Tailwind CSS v4.
- `@learnui/native` peers: React, React Native, Tailwind CSS v4, Uniwind, and React Native Reanimated.
- Expo belongs to the private Native Gallery rather than the published Native package.
- `tailwind-variants` remains an internal runtime dependency.
- `react-native-reanimated` is a non-optional peer and a development dependency because the accepted Native Switch directly imports it.
- `react-native-worklets` is not a direct LearnUI peer unless published LearnUI source imports it. Reanimated owns that dependency contract; the Native Gallery and external fixture install versions compatible with the selected Reanimated release.
- Exact compatible ranges are set during implementation from the selected Expo and upstream compatibility matrices.

### Installation responsibility

- JavaScript and styles are separate, explicit imports.
- Web consumers import Tailwind CSS v4 and `@learnui/web/styles`.
- Native consumers import Tailwind CSS, Uniwind, and `@learnui/native/styles` in their global CSS, then configure `withUniwindConfig` in their own Metro config.
- Packages do not use postinstall scripts, edit consumer files, inject CSS, or take ownership of consumer bundler configuration.

### Public package surface

- V1 exports only each package root and `./styles`.
- The Web tarball allowlist contains only `dist` plus npm-required package metadata, README, and LICENSE.
- The Native tarball allowlist contains cleaned `src` and `lib` trees plus npm-required package metadata, README, and LICENSE. Negative checks exclude stories, tests, fixtures, mocks, private configuration, and stale build output.
- Storybook, Expo Gallery, stories, tests, research, and internal configuration are excluded.

### External consumer fixtures

- Tracked minimal Web and Native fixture templates are not PNPM workspaces.
- Verification packs each component package, copies a fixture outside the workspace, and installs the tarball without workspace links or source aliases.
- The Web fixture runs type checking and a production build, then verifies an internal default class and a consumer override.
- The Native fixture runs type checking and Expo exports for iOS and Android, then verifies internal default, slot, compound-variant, and consumer-override styles.
- Verification checks the tarball allowlist and duplicate React or React Native runtimes.
- Storybook and the Expo Gallery remain responsible for manual interaction, visual, accessibility, and real-device checks.
- V1 automates the fixture with PNPM only.

## Consequences

- A workspace-successful build is not considered installable until the packed tarball passes outside-workspace fixtures.
- Consumers perform a small amount of explicit CSS and Metro setup, but packages never mutate their projects.
- V1 does not promise per-component subpath exports or an npm, Yarn, and Bun installation matrix.
- Native bundling checks do not replace later iOS and Android real-device interaction testing.
