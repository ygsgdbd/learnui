# ADR-0008: Adopt Precision Workbench as the V1 visual and motion baseline

- Status: Accepted
- Date: 2026-08-23

## Context

The V1 token values and motion feel required an interactive artifact rather than a paper-only decision. Three disposable directions were compared: Air Gallery, Precision Workbench, and Tactile Shelves. Precision Workbench was selected, then translated into an isolated Expo prototype using React Native, Uniwind, Tailwind CSS v4, tailwind-variants, and Reanimated.

The Expo prototype passes type checking and iOS/Android production bundling. Full device interaction could not run because the local Xcode Simulator SDK and installed runtime versions do not match, and Android SDK/ADB is absent. Installing multiple large toolchains would exceed the intended cost of this decision prototype.

## Decision

- B — Precision Workbench is the V1 direction for component-development hosts.
- The structure is a component navigator, central specimen, and separate state/token inspector. Wide displays may use columns; phones fold the same hierarchy into a single stack.
- The visual baseline favors system typography, semantic blue accent, near-solid surfaces, explicit borders, restrained shadow, compact spacing, and minimal glass stacking.
- Existing light/dark color, radius, type, and material values in `DESIGN.md` are accepted as V1 defaults.
- Press feedback begins immediately and uses restrained scale near 0.98. Toggle travel uses a critically damped, interruptible spring without decorative bounce. Reduced motion removes scale/travel while retaining state feedback.
- Motion implementation details remain internal rather than public component props.
- Physical iOS/Android touch, VoiceOver/TalkBack, frame pacing, dynamic text, and reduced-motion verification move to the V1 acceptance matrix and remain release gates.

## Consequences

- Production hosts have a concrete direction without copying throwaway prototype code.
- Formal components must be rewritten under the implementation and testing workflow; the prototype is evidence, not a codebase starter.
- Bundle success is not treated as proof of device behavior.
- Acceptance testing may correct device-specific defects in values or motion parameters, but changing the overall direction or public theme contract requires reopening the relevant decision.
