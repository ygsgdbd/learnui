# ADR-0009: Require layered automated and human V1 quality gates

- Status: Accepted
- Date: 2026-08-23

## Context

LearnUI wraps accessible Web primitives and implements custom Native controls. Type checks, component tests, Storybook, production bundles, accessibility scanners, development builds, screen readers, physical devices, and package fixtures each prove different things. Treating any one signal as completion would leave load-bearing behavior unverified.

A single coverage percentage, one browser, an automated accessibility scan, or a native E2E framework would be easier to report, but none can sign the cross-platform semantic, packaging, visual, motion, and assistive-technology contracts.

## Decision

- Adopt the executable matrix in `docs/qa/V1_ACCEPTANCE.md`.
- Run deterministic, browser, package, and bundle gates on every relevant PR using explicit path filters.
- Run native development builds on PRs that affect Native source, dependencies, Metro, Expo configuration, or native assets.
- Require one reviewed visual-baseline system, not parallel competing systems.
- Require human release-candidate sign-off with VoiceOver/Safari, NVDA/Chrome, a physical iOS device, and a physical Android device.
- Record OS, browser, assistive-technology, device, build SHA, settings, reviewer, date, results, and linked exceptions in `docs/qa/releases/<version>.md`.
- Keep physical-device accessibility, dynamic text, system preferences, touch, and production-like frame pacing as release gates. Missing tools or devices means unverified, not passed.
- Use behavior and risk contracts instead of an arbitrary global coverage percentage. Coverage may not fall below the committed baseline and is used to find omissions.
- Do not make Maestro or Detox blocking V1 gates. Maestro may later provide a non-blocking Gallery smoke; Detox is not selected for V1.
- Use scenario-based motion/performance checks instead of a device-independent universal FPS number.

## Consequences

- Some release gates require specific people, operating systems, assistive technologies, and physical hardware.
- PR automation remains path-aware, but a documentation-only label cannot manually bypass code-derived filters.
- Production bundles and development builds remain necessary but insufficient evidence.
- Exceptions to axe or accessibility rules require a tracked issue, owner, reason, and expiry.
- A release candidate without a complete acceptance record cannot be described as ready to publish.
