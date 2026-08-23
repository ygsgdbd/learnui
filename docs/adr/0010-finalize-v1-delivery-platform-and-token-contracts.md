# ADR-0010: Finalize V1 delivery, platform, and token contracts

- Status: Accepted
- Date: 2026-08-23

## Context

The preceding ADRs define the monorepo, package boundaries, styling, build tools, Gallery, tokens, component APIs, visual direction, motion, and quality gates. Final implementation still required explicit decisions for package identity, CI ownership, visual-baseline ownership, supported operating systems, the complete public-token list, and Native field-state semantics.

Leaving any of these as implementation-time choice would make the V1 specification ambiguous and allow different implementations to satisfy different contracts.

## Decision

### Package identity

- The V1 package manifests and consumer imports use `@learnui/web` and `@learnui/native`.
- npm scope ownership, actual npm publication, and release automation are outside V1.

### CI and visual baseline

- GitHub Actions is the V1 CI provider for hosted Web, package/export, external-fixture, and Native bundle/build jobs.
- Fixed-environment Playwright screenshots own the single visual baseline.
- V1 does not require EAS Build, Chromatic, or self-hosted runners.

### Supported Native platforms

- iOS support begins at 16.4 and covers iPhone and iPad.
- Android support begins at API 24 and covers phones and tablets.
- Every release candidate requires a physical iPhone and a physical Android phone. Tablet acceptance may use an iOS Simulator or Android Emulator.
- React Native Web is outside V1.

### Public tokens

- The table under `DESIGN.md` → “Public theme-token contract” is the exhaustive V1 public-token list and default-value contract.
- Tokens not listed there remain internal. Adding a public token is additive; removing or renaming one is breaking.
- Both packages expose every listed `--learnui-*` name in light and dark modes, with system mode as the default and an explicit host override taking precedence.

### Native Checkbox and Switch states

- Native Checkbox and Switch support `isReadOnly`, `isRequired`, and `isInvalid`, with `Description` and `ErrorMessage` parts.
- Readonly controls remain accessibility-focusable but do not change value.
- Required and invalid states expose visual treatment, React Native accessibility state, and associated text. They do not emulate browser form validation or block application submission.
- `docs/qa/V1_ACCEPTANCE.md` verifies these semantics and the public visual axes in system, light, and dark Gallery pages.

## Consequences

- Implementation has named owners for CI and visual evidence rather than choosing SaaS or infrastructure during delivery.
- The minimum OS versions and required physical-device evidence are release contracts.
- Consumer branding has a finite, testable public surface.
- Native validation semantics remain useful and accessible without making false browser-equivalence claims.
- Changes to these contracts require an ADR rather than an incidental package or test edit.
