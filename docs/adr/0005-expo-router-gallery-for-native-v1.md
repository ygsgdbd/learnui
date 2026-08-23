# ADR-0005: Use an Expo Router Gallery for the Native V1 showcase

- Status: Accepted
- Date: 2026-08-23

## Context

React Native Storybook can render real Native components on devices and simulators, but it adds a second presentation model and a substantial on-device UI dependency set. HeroUI Native instead uses a routed Expo showcase. LearnUI already uses Storybook for the Web package and needs the Native host to emphasize touch, accessibility, composition, Uniwind, and motion on iOS and Android.

## Decision

- V1 uses an Expo Router Gallery without React Native Storybook.
- The Gallery has a Components section for isolated variants, sizes, states, parts, and accessibility, plus a Showcases section for realistic composition, themes, and motion.
- The Gallery depends on `@learnui/native` through `workspace:*` and imports only public package entries. It does not alias or import package internals.
- The package's React Native export may point to published source for development; tarball fixtures separately verify distribution artifacts.
- Expo development builds are authoritative. iOS Simulator and Android Emulator support daily checks; physical iOS and Android devices support touch, motion, performance, dynamic text, and screen-reader acceptance.
- Expo Go is a best-effort convenience and is not a V1 compatibility guarantee.
- The Gallery follows the system theme by default and provides explicit light and dark preview modes.
- Native Storybook may later be added to the same private host through entry-point swapping. It does not require another workspace.

## Consequences

- Native component examples can prioritize real scenarios and platform behavior with a smaller first-version toolchain.
- V1 does not gain Storybook controls or the Native addon panel.
- Gallery examples must deliberately cover the state matrix that stories would otherwise enumerate.
- Public API violations are visible because the Gallery cannot import internal source paths.
- A future Native Storybook addition must preserve the Gallery and cannot redefine React Native Web output as iOS or Android fidelity.
