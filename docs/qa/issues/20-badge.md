# Issue #20 — Badge acceptance

- Issue: https://github.com/ygsgdbd/learnui/issues/20
- Base: `ceb0d830de258b90e3f56d9bee0b828c7af0d411` (`origin/main`, verified 2026-09-12).
- Dependency: #15 closed; #20 had no comments when implementation began.
- Implementation commit: `bdcec378e681496c479cf153f8bd2fa4b5b144ea`; reviewed Native token fix: `4d9ce8a` (the runtime Metro source).
- Reviewer: Codex; automated and simulator observations are not human release sign-off.

## Scope and seams

Both public package roots expose a non-interactive inline text Badge. The acceptance seams are public-entry component tests, browser stories, the Native Gallery, and real tarballs installed outside the workspace. Visual axes: solid/soft/outline; neutral/accent/success/warning/destructive; sm/md. Decorative embedding transfers meaning to the accessible owner.

## Environment and resource isolation

- macOS host; Xcode 26.5 (17F42), iOS 26.5 Simulator.
- Badge iPhone 17 Pro: `273153FF-4DDC-45DF-BAB8-4192346DBCEF`; Metro 8120.
- Button owns iPhone 17 and Metro 8089; Card reserved iPhone 17 Pro Max and Metro 8191. Neither is used by this task.
- Badge Android uses an independent AVD under `/tmp/learnui-badge-avd` and `emulator-5562`; no shared userdata, App installation, or Metro binding with Button/Card.
- Initial Android build with `/opt/homebrew/opt/openjdk@23` failed: that symlink actually resolves to JDK 26.0.2.1. Android Studio JBR 25.0.3 plus `JAVA_TOOL_OPTIONS=--enable-native-access=ALL-UNNAMED` succeeded.

## Results

| Gate | Result |
| --- | --- |
| Foundation | 12/12 passed |
| Native component suite after token fix | 32/32 passed; Badge 10 |
| Native + Gallery typecheck | passed |
| Web build, Storybook typecheck/static build | passed |
| Web browser regression + axe | 52/52 passed: Chromium, reduced-motion Chromium, Firefox, WebKit (13 each) |
| Web tarball outside workspace | passed, including declarations/default/solid/consumer override CSS |
| Native tarball outside workspace | passed, iOS and Android exports, generated registry properties/token references, runtime de-duplication |
| Web pack allowlist + Web/Native Publint | passed |
| Android development build | passed, Debug/arm64-v8a APK, 455 Gradle tasks; installed, launched and operated on Android 16 emulator |
| iOS development build | passed (0 errors, 2 warnings); installed, launched and operated on iOS 26.5 Simulator |

### Review findings and resolution

Standards identified missing Native public font-token consumption; fixed with the explicit family-name utility and consumer font/weight override test. Spec identified source-string-only smoke assertions; fixed by extracting compiled Uniwind registry arrays and requiring native properties and token references.

The stronger check exposed an actual issue: shorthand `bg-[--token]/10` compiled to `colorMix(undefined, ...)`, and shorthand text-token rules were absent. Badge and its new Gallery content now use explicit `var(...)` classes. Both review axes rechecked the fixes and reported no remaining findings. The real external fixture then passed on both platforms.

### Transient environment failures

An overlapping Web build initially packed before declarations were restored; a serialized retry passed. Native fixture installation initially used stale registry metadata for `metro-symbolicate@0.84.6`; a task-local metadata cache resolved it without altering shared caches. Heavy concurrent native builds caused browser connection timeouts; no assertion timeout or accessibility rule was disabled.

## Development-build runtime observations (2026-09-12)

Both installed development builds connected to the task-local Metro server on port 8120 using the reviewed token fix plus the Gallery inset adjustment. Production exports are separately recorded in `20-badge/gallery-export.log`.

- iOS: system resolved dark; explicit Light and Dark were operated and the resolved label changed correctly. All variants/colors, sizes, owner and overrides were inspected. At `accessibility-extra-extra-extra-large`, the owner and custom status reflowed without visible clipping; screenshots record this scope, not every long-label/theme combination. Restored content size to `large`.
- Android 16: system resolved light; explicit Light and Dark were operated. All variants/colors, sizes, owner and overrides were inspected. At `font_scale=2.0`, the Activity restarted; Badge was reopened and the long status wrapped into two complete lines, with the owner and custom override visible. Restored font scale to 1.0.
- iOS accessibility snapshot exposes the owner as `Inbox, 3 unread messages` without a separate decorative label. Android's inspection tree exposes the named owner and also child text; this tree alone does not establish TalkBack focus/announcement behavior. Component tests verify the decorative accessibility props. Screen-reader behavior remains unverified.
- Runtime inspection found the iOS large-title navigation bar obscured the Gallery header. Adding `contentInsetAdjustmentBehavior="automatic"` to this screen's ScrollView fixed the observed top inset; the updated Gallery typecheck passed. This changes the demo container only.
- Android APK SHA-256: `39eee6b029e865c15c02b30f32e782915fa6bb321e158658f3b86ba806f74412`.
- Android build summary: `BUILD SUCCESSFUL in 34m 29s`; 455 tasks (87 executed, 25 cached, 343 up-to-date). Native generated projects and binaries are intentionally not committed.

Evidence: `20-badge/ios-system-dark.png`, `ios-light.png`, `ios-ownership-overrides.png`, `ios-maximum-text-ownership.png`, `android-light.png`, `android-dark.png`, `android-large-text.png`, and the platform ownership-tree JSON files. Browser, unit, fixture, export and package logs are in the same directory. Screenshots are observations, not approved visual baselines.

## Release-only evidence

Physical iOS and Android devices, VoiceOver/TalkBack, VoiceOver/Safari, NVDA/Chrome, human visual-baseline approval, real OS high-contrast preferences, and production-like frame pacing are **unverified**. Simulator screenshots, accessibility trees, bundle exports and mocked component tests cannot replace those checks.
