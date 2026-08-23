# ADR-0006: Share semantic tokens while keeping platform-owned theme files

- Status: Accepted
- Date: 2026-08-23

## Context

Web and Native need a recognizable LearnUI design language, installable package boundaries, platform-specific Tailwind and Uniwind delivery, consumer branding, dark mode, and accessibility preference handling. A shared runtime token package or code generator would reduce textual duplication but add another package and build dependency before two platform implementations have demonstrated stable common needs.

Generic variable names would also collide with consumer design systems, while making every foundation value public would let theme overrides break layout and accessibility invariants.

## Decision

### Ownership and naming

- `DESIGN.md` defines token meanings and accepted V1 default values.
- Web and Native own separate platform CSS implementations.
- Shared semantics use matching `--learnui-*` public names. A contract test verifies that the required names exist in both packages; values may differ by platform.
- V1 has no shared runtime token package or token code generation.
- Public token names are a semantic-versioning contract. Removing or renaming one is breaking.

### Public and internal layers

- Consumers may override semantic colors, font families, radius style, and shadow/material strength.
- Spacing, control heights, typography sizes and leading, minimum hit targets, motion physics, gesture thresholds, and structural dimensions remain internal invariants.
- Components consume semantic tokens rather than literal light/dark colors.

### Theme modes

- V1 supports system, light, and dark. System is the default; explicit light or dark host selection takes precedence and system mode updates live.
- Web hosts apply a root `data-theme` override. Native hosts use `Uniwind.setTheme` with `system`, `light`, or `dark`.
- Storybook and the Native Gallery own optional persistence of their preview choice. Component packages provide no ThemeProvider and persist no theme state.
- Consumers can brand light and dark modes by overriding public tokens. Arbitrary named themes and a LearnUI custom-theme API are not V1 contracts.

### Accessibility preferences

- Reduced motion applies on Web, iOS, and Android.
- Reduced transparency applies where browsers expose it and on iOS through React Native. Android defaults must remain readable without the signal.
- High contrast applies through Web `prefers-contrast` and Android high text contrast. iOS retains the baseline contrast guarantee without claiming an unavailable React Native preference.
- Reduced-transparency material becomes near-solid without blur and gains an explicit border. Reduced-motion spatial movement becomes a short cross-fade or static state.
- Dark mode does not imply any accessibility preference.

### Default values

- Existing Apple-inspired color, radius, material, and type values were provisional until the prototype decision.
- ADR-0008 accepts the B — Precision Workbench values as V1 defaults. Real-device acceptance may correct platform defects but cannot change public names or the theme-mode contract without reopening this decision.

## Consequences

- Platform theme files contain intentional duplication, controlled by a token-name contract test.
- Consumers can brand the library without gaining control over accessibility-critical geometry or motion physics.
- Platform accessibility behavior is truthful rather than artificially symmetrical.
- A future shared token generator must demonstrate enough repeated maintenance cost to justify reopening this ADR.
