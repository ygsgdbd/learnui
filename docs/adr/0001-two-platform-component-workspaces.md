# ADR-0001: Separate publishable component packages from showcase hosts

- Status: Accepted
- Date: 2026-08-23

## Context

LearnUI is intended to teach component construction on both the Web and React Native. The two platforms can share product language and design values, but their accessibility, interaction, styling, and rendering APIs differ.

## Decision

Use a PNPM monorepo with two publishable component packages and two private showcase hosts:

- `packages/web` publishes `@learnui/web` and uses React Aria Components with Tailwind CSS v4.
- `packages/native` publishes `@learnui/native` and uses React Native primitives with Uniwind and Tailwind CSS v4.
- `apps/web-storybook` privately hosts Web stories and consumes `@learnui/web`.
- `apps/native-gallery` privately hosts the Expo gallery and consumes `@learnui/native`.

The component packages share documented design tokens conceptually through `DESIGN.md`. They do not share runtime component code in the first version. Showcase hosts must depend on public package entry points rather than component internals.

## Consequences

- Web semantics stay aligned with browser and React Aria behavior.
- Native semantics stay aligned with React Native accessibility APIs.
- Similar components may contain intentional platform-specific differences.
- Storybook, Expo, and Metro dependencies stay outside the published packages.
- Packaged artifacts can be tested independently from their development hosts.
- A shared token package may be introduced only after repeated cross-platform needs are demonstrated.
