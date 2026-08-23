# LearnUI V1 Acceptance Matrix

This document defines release gates, not current pass status. A weaker layer never substitutes for a stronger one.

## Gate cadence

GitHub Actions is the V1 CI provider for Web, package/export, external-fixture, and Native bundle/build automation. V1 does not require EAS Build, Chromatic, or self-hosted runners.

### Every relevant pull request

- Type checking and deterministic unit/component tests.
- Web Storybook static build, Storybook Vitest Browser Mode, interaction tests, and axe scan.
- Chromium, Firefox, and WebKit Playwright critical paths.
- Web and Native package builds.
- Pack manifest, Publint, and workspace-external consumer fixtures.
- iOS and Android Expo production exports.
- Native development builds when Native code, dependencies, Metro, Expo config, or native assets change.

Path filters are source-controlled. A manually applied docs-only label does not bypass derived native or package changes.

### Every release candidate

- One reviewed visual baseline diff.
- VoiceOver with Safari on macOS.
- NVDA with Chrome on Windows.
- A physical iOS device and a physical Android device.
- Real keyboard, zoom/font scaling, theme, contrast/transparency preferences, reduced motion, touch, motion, and frame-pacing checks.
- A completed `docs/qa/releases/<version>.md` record.

## Web automated gates

### Deterministic and component contracts

- Vitest Node covers pure variant mapping, class merging, token names, and other deterministic helpers only.
- Storybook with the Vitest addon runs every stable story in Chromium. Stories with behavior include `play` assertions.
- Testing Library/browser queries use role and accessible name first; test IDs are a last resort.
- Public roots and parts are imported from the package entry and verify ref forwarding plus merge-last class behavior.
- TextField, Checkbox, and Switch verify both controlled and uncontrolled behavior.

### Browser and accessibility

- The Storybook a11y addon reports zero axe violations for stable stories.
- Axe `incomplete` results receive a documented human review.
- A disabled rule, excluded selector, or todo requires a GitHub Issue, owner, reason, and expiry date. Expired exceptions block again.
- Playwright runs critical flows in Chromium, Firefox, and WebKit.
- Button, TextField, Checkbox, and Switch cover keyboard, pointer, state, form, and validation paths. Card, Badge, Divider, and Spinner each have at least one cross-browser semantic test.
- `storybook build` must pass but is never described as interaction or accessibility proof.

### Themes and visuals

- System/light/dark priority and public-token overrides are tested.
- High contrast/forced colors and reduced motion are exercised through browser emulation plus real-OS review.
- Fixed-environment Playwright screenshots are the single visual baseline owner. Chromatic is not part of the V1 gate.
- Public axes are all represented; high-risk states are explicit; remaining combinations use representative/pairwise coverage rather than a Cartesian snapshot matrix.
- Baseline updates require human review.

## Native automated gates

### Jest and React Native Testing Library

- Public API, parts, roles, accessible names/states, callbacks, disabled/pending/decorative semantics, and reduced-motion branches are covered.
- Native Checkbox and Switch cover readonly, required, and invalid semantics plus Description/ErrorMessage relationships. Readonly remains focusable without changing; required/invalid never claim browser-style submit blocking.
- TextField, Checkbox, and Switch cover controlled and uncontrolled behavior.
- Reanimated mocks may prove target style and reduced-motion branching, but test names never claim smoothness or frame rate.
- Public roots/parts verify refs, class/style order, and public-entry imports.

### Package and bundle

- Builder Bob ESM and TypeScript output succeeds twice from clean output.
- Pack contents match ADR-0003 and contain no hosts, stories, tests, research, or private config.
- A real tarball is installed in a fixture outside the workspace with no source alias.
- The fixture typechecks, resolves root and `./styles`, finds internal/default/slot/compound/consumer-override Uniwind classes, and has no duplicate React/React Native runtime.
- iOS and Android `expo export` both pass. This proves bundling only.

### Development builds

- iOS Simulator and Android Emulator development builds compile, install, and launch.
- Gallery imports only public package entries.
- Components provides one page for each of the eight components. Every page covers every public visual axis and the component's principal states in system, light, and dark modes.
- Showcases covers cross-component composition, theme propagation, and motion.
- Expo Go is best-effort and not a gate.

## Human accessibility and device gates

### Supported Native platforms

- iOS 16.4 or newer on iPhone and iPad.
- Android API 24 or newer on phones and tablets.
- Every release candidate requires one physical iPhone and one physical Android phone.
- iPad and Android tablet acceptance may use a Simulator or Emulator; a physical tablet is not required for every release candidate.

### Web

- macOS VoiceOver + Safari and Windows NVDA + Chrome cover all eight components.
- Verify role, name, state/value, label/description/error relationships, focus order, activation, dynamic announcements, 200% zoom, real keyboard use, Windows high contrast, and reduced motion.
- Axe zero means only that the configured automatic rules found no violations; it is not a WCAG-conformance statement.

### Native

- Record at least one supported physical iOS device and one supported physical Android device.
- iOS: VoiceOver, maximum Dynamic Type, dark mode, Reduce Motion, and applicable transparency settings.
- Android: TalkBack, maximum font/display size, dark mode, Remove animations/reduced motion, and high text contrast.
- Verify labels/roles/states, focus sequence, activation, touch targets, content reflow, theme propagation, and no duplicate focus.
- Production-like release/profile builds provide frame-pacing evidence; development mode does not sign performance.

If compatible Xcode/Android tooling or hardware is missing, the gate remains unverified.

## Eight-component minimum

| Component | Automated minimum | Human minimum |
| --- | --- | --- |
| Button | Variants/sizes; pointer/keyboard/press; disabled; pending blocks repeat while preserving name/focus; icon-only label; decorative internal Spinner | Immediate press; button/name/disabled/busy announcement; no second focus; reduced motion |
| TextField | Parts and refs; controlled/uncontrolled; typing; disabled/readonly/required/invalid; Web form/validation; Native label fallback | Label/description/error speech order; keyboard/input behavior; maximum text without clipping or repeated error interruption |
| Checkbox | Controlled/uncontrolled; checked/mixed/disabled/readonly/required/invalid; Description/ErrorMessage; mixed requests true; one accessible root; form value on Web | Checked/mixed/disabled/readonly/required/invalid speech; 44×44 target; fast touch; description/error reflow |
| Switch | Controlled/uncontrolled; selected/disabled/readonly/required/invalid; Description/ErrorMessage; one accessible root; animation target and reduced branch | On/off and readonly/required/invalid speech; ten rapid reversals retarget live with no jump; reduced motion; description/error reflow; frame pacing |
| Card | Six parts/refs; variants; no implicit interactivity or grouping | Natural reading order and heading use; long content reflow; theme/border visibility; no extra focus |
| Badge | Variants/colors/sizes; text conveys meaning; decorative embedding moves meaning to owner; no press API | No color-only meaning; no extra focus; high contrast/dark readability; text scaling |
| Divider | Decorative default hidden; semantic opt-in; orientation/weight mapping | Decorative skipped; semantic announcement acceptable; hairline visible at target scale |
| Spinner | Standalone label/progress semantics; embedded decorative with busy owner; reduced fallback | No duplicate announcement; reduced motion removes continuous spin; 30-second run has no repeatable hitch |

## Motion and performance scenarios

### Web

- Rapidly trigger Button and pending entry/exit.
- Reverse Switch repeatedly.
- Verify keyboard activation is not delayed by decorative motion.
- Reduced motion removes scale, travel, and continuous spinning while preserving state feedback.
- Animate necessary transform/opacity paths rather than layout properties where applicable.

### Native

- Reverse Switch ten times rapidly; motion retargets from the live position with no jump or lockout.
- Press Button twenty times; pointer/touch-down feedback is immediate and final state is correct.
- Run Spinner for thirty seconds; no repeatable visible hitch.
- Inspect UI and JS frames on physical devices using production-like builds when a problem requires quantification.

Repeatable input latency, visible hitching, interaction lockout, or motion that ignores reduced preferences blocks release.

## Coverage and E2E policy

- No arbitrary global coverage percentage substitutes for the component matrix.
- Critical controlled/uncontrolled, pending, indeterminate, validation, decorative, theme, and reduced-motion branches are fully covered.
- Coverage cannot regress below the committed baseline and is used to find omissions.
- Large DOM/class snapshots are not primary evidence.
- Maestro and Detox are not blocking V1 gates. A future non-blocking Gallery smoke may prefer Maestro after pages stabilize.

## Accessibility exception policy

Every exception records:

- linked GitHub Issue;
- owner;
- exact rule/selector/context;
- user impact and reason;
- creation and expiry dates;
- remediation or re-evaluation plan.

Expired exceptions block release automatically.

## Release acceptance record

Create `docs/qa/releases/<version>.md` with:

- release version and commit/build SHA;
- date and reviewer;
- automated gate links/results;
- OS, browser, and assistive-technology versions;
- iOS/Android device models and OS versions;
- theme and accessibility settings;
- eight-component checklist results;
- visual baseline approval;
- motion/performance observations;
- known limitations and linked exceptions/issues.

Without this record, the human release gate is incomplete.
