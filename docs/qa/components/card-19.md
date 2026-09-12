# Card #19 acceptance

- Issue: https://github.com/ygsgdbd/learnui/issues/19
- Draft PR: https://github.com/ygsgdbd/learnui/pull/33
- Date: 2026-09-12. Reviewer: Codex automated inspection; no human sign-off.
- Baseline: `ceb0d830de258b90e3f56d9bee0b828c7af0d411`; fetched again after runtime acceptance, unchanged. Divider dependency #15 is closed.
- Component source: `1e96746`. Final runtime follow-up adds only `contentInsetAdjustmentBehavior="automatic"` to the Gallery Card ScrollView; served through the same development client's Metro connection.
- Scope: `Card.Root/Header/Title/Description/Body/Footer` on both public entries; surface/elevated/outline, refs and consumer overrides. No implicit controls, selection, disabled state or accessibility grouping.

## Automated results

- Native Jest: **33/33 passed**, three suites (Card: 11, plus Spinner and Divider). The initial public composition test failed before implementation. RNTL host mocks verify contracts, not native painting or screen-reader speech.
- Storybook/axe: **48 passed** — 12 each in Chromium, reduced-motion Chromium, Firefox and WebKit; no axe rules disabled.
- `scripts/check-card-browser.mjs`: light/dark, contrast, supported forced-colors and 200% horizontal text reflow passed in all three browser engines. Chromium reduced transparency resolves the actual elevated token color. Firefox media emulation is set before navigation because dynamic emulation changed matchMedia but did not update CSS reliably in this environment.
- Foundation: **12 passed**. Workspace typecheck, static Storybook build, Web pack manifest/Publint and workspace-external real tarball install/typecheck/production build/CSS/single-runtime checks passed.
- Native clean Bob build, pack/Publint, real external tarball install/typecheck, iOS/Android exports and actual generated Uniwind property/token lookups passed. Gallery production exports and public-import verification passed.
- After the final Gallery inset fix: Gallery typecheck and `git diff --check` passed; iOS runtime checks below used the updated screen. No native dependency or component code changed in this follow-up.

## Review findings resolved

- Standards review: Native Title/Description now consume `font-[family-name:var(--learnui-font-sans)]`; font family and semibold must coexist after class merging.
- Spec review: added explicit preference and 200% browser checks. No remaining API/scope finding was reported.
- Native classes use explicit `var(...)` so Uniwind generates variable lookups rather than literal strings. External consumer assertions inspect compiled background, border, radius, font family, text and padding entries.
- Dark Story axe revealed a white host canvas behind transparent Cards; the canvas now uses the semantic theme token.
- Actual iOS execution revealed that the large native navigation header obscured the Gallery title/theme controls. Automatic ScrollView safe-area insets fix this locally; the controls were then visibly operated and their resulting theme state verified.

## Native build identity and reproduction

Host: macOS 26.6.2 (25G83), Xcode 26.5 (17F42), Expo 57 / React Native 0.86.2. Both are development builds, installed and launched with Metro on isolated port 8191, application `dev.learnui.gallery`.

### iOS

- iPhone 17 Pro Max simulator, iOS 26.5; UDID `1749A854-1D43-484C-A953-CCB1FFDAE3B8`.
- Workspace/scheme: `apps/native-gallery/ios/LearnUINativeGallery.xcworkspace` / `LearnUINativeGallery`.
- `xcodebuild -workspace apps/native-gallery/ios/LearnUINativeGallery.xcworkspace -scheme LearnUINativeGallery -configuration Debug -sdk iphonesimulator -destination 'id=1749A854-1D43-484C-A953-CCB1FFDAE3B8' -derivedDataPath /tmp/learnui-card-ios -jobs 2 CODE_SIGNING_ALLOWED=NO build`: **BUILD SUCCEEDED**.
- Installed `/tmp/learnui-card-ios/Build/Products/Debug-iphonesimulator/LearnUINativeGallery.app`; bundle loaded successfully from Metro.
- Executable SHA-256: `e9ae1f9202ea4f5ff11c66a20430020849cc2a9681baa8fdf842a7521f520bf4`.
- Debug dylib SHA-256: `31f557f2d6f0803e1b8722a290251c2a8824bbef12ae040ce44c41ec1709808c`.
- These hashes identify the native development host; JavaScript was served separately by Metro, including the final Gallery inset fix.

### Android

- New isolated `LearnUI_Card` AVD under `/tmp/learnui-card-avd`, emulator-5560, API 36 arm64, 1080 × 2400 / density 420. Only hardware configuration reused, no shared userdata/snapshots.
- From `apps/native-gallery/android`, built with Android SDK in `~/Library/Android/sdk`, Android Studio JBR, `JAVA_TOOL_OPTIONS=--enable-native-access=ALL-UNNAMED`, `CMAKE_BUILD_PARALLEL_LEVEL=2`:
  `./gradlew :app:assembleDebug -PreactNativeArchitectures=arm64-v8a --max-workers=2`: **BUILD SUCCESSFUL** (17m38s retry).
- Installed `app/build/outputs/apk/debug/app-debug.apk`; reversed tcp:8191 and launched the Expo development-client URL, then navigated to Card.
- APK SHA-256: `b3cd30e2611c28b3abace856d24bfa21aafbf97bb5fa1af0d9c031bc2042de34`.

## Observed runtime acceptance

| Check | iOS Simulator | Android Emulator |
| --- | --- | --- |
| Compile, install, launch, real bundle | Passed | Passed |
| Gallery → Card | Actual link navigation | Actual route/navigation |
| Three variants, text, padding, radius, border | Visually inspected in light/dark | Visually inspected in light/dark |
| Theme controls | Actual Light → Dark → System; resolved states verified | Actual Dark → Light; resolved states verified |
| Large text and long content | Largest accessibility Dynamic Type; scrolled to final Children only example | font_scale 2.0; scrolled to final Children only example |
| Consumer override | Blue border and larger title visible | Blue border and larger title visible |
| Accessibility tree | Separate ordered text nodes observed, no root aggregate label | Long-content TextView and passive ancestor nodes observed |

Large text wrapped within Card width and the final example remained reachable. At the largest iOS size, the Gallery's three theme button labels wrap across lines; this is documented, not a claim of human visual approval. Both device font settings were restored (`large` / `1.0`). Tree inspection does not prove spoken order or focus behavior.

### Screenshots

- [Android system/light](card-evidence/android-system-light.png)
- [Android dark](card-evidence/android-dark.png)
- [Android 200% text](card-evidence/android-font-200.png)
- [Android 200% long-content end and Children only](card-evidence/android-font-200-bottom.png)
- [iOS light after inset fix](card-evidence/ios-light.png)
- [iOS dark after actual control activation](card-evidence/ios-dark.png)
- [iOS largest Dynamic Type, System resolving light](card-evidence/ios-largest-type.png)
- [iOS largest Dynamic Type at content end](card-evidence/ios-largest-type-bottom.png)

## Environmental failures and limits

- Initial Android CMake compile failed on restricted `java.lang.System` native access; retry used Android Studio JBR/native-access flag. Initial iOS high-concurrency build was intentionally restarted at two jobs with its DerivedData retained.
- Early Firefox startup and Native first-test timeouts were followed by successful unmodified reruns; concurrent builds are a plausible cause, not a performance measurement. No test timeout was raised to mask a failure.
- Native external installation initially used stale pnpm Metro metadata. `pnpm cache delete "metro-*"` refreshed it; no dependency/version replacement bypassed the real installation.
- Android cold boot showed Process system/System UI ANR dialogs; choosing Wait eventually allowed actual page acceptance. This environment does **not** establish smooth startup or frame pacing.
- **Unverified gates:** physical iPhone/Android behavior, VoiceOver/TalkBack speech and focus sequence, browser NVDA/VoiceOver manual use, human visual-baseline approval, and release/profile physical-device performance. Native reduced-transparency behavior has unit coverage; live iOS setting/assistive speech was not manually verified.
- Simulator screenshots, AX trees, axe and development builds do not constitute full WCAG or production performance approval. PR remains Draft; no automatic merge or issue closure.
