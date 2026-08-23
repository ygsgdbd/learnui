# ADR-0007: Adopt a composition-first cross-platform V1 component contract

- Status: Accepted
- Date: 2026-08-23

## Context

LearnUI needs recognizable Web and Native APIs without hiding meaningful platform behavior. React Aria Components now models TextField, Checkbox, and Switch as compound fields, while React Native has different labeling, validation, control, and accessibility capabilities. Forcing identical primitives or duplicating every upstream prop would create a broad but misleading contract.

The visual language must remain consistent across platforms, but pixel identity and a universal variant set are not goals.

## Decision

### Global API rules

- Compound components use namespace exports with an explicit `Root`; simple components use a direct root export. Flat part aliases are not provided.
- Text values use `value`, `defaultValue`, and `onChange`. Boolean controls use `isSelected`, `defaultSelected`, and `onSelectedChange`.
- Shared boolean states use `isDisabled`, `isReadOnly`, `isRequired`, and `isInvalid`; DOM-style aliases are not provided.
- Each root and part extends its platform primitive props after omitting fields owned by LearnUI. Web-only and Native-only capabilities remain platform extensions.
- Every public root and part forwards its platform ref. V1 defines no custom imperative handle and no cross-platform `as` or `asChild`.
- Visual intent, token hierarchy, sizing, radii, and component silhouette align across platforms. Font rendering, shadows, focus, touch feedback, and other platform details may differ.
- Visual props are component-specific rather than a universal variant enum. Consumer classes and Native styles remain escape hatches under ADR-0002.

### Button

- Button is a single root with `onPress`, `isDisabled`, and `isPending`.
- Pending prevents repeat activation, preserves focus and the action label, and owns a decorative internal Spinner.
- Icon-only buttons require an accessible name.
- Variants: primary, secondary, outline, ghost, destructive. Sizes: sm, md, lg.

### TextField

- Parts: Root, Label, Input, Description, ErrorMessage.
- Root supports controlled and uncontrolled text state plus required, invalid, readonly, and disabled semantics.
- Web retains React Aria form and validation extensions. Native exposes TextInput platform props without pretending to provide browser form validation.
- A plain-text Native Label supplies the iOS accessibility-label fallback. Complex label content requires an explicit Input accessibility label.
- Variants: outline, filled. Sizes: sm, md, lg.

### Checkbox

- Parts: Root, Control, Indicator, Label, Description, ErrorMessage.
- Both platforms use a customizable compound control. Native does not use Expo Checkbox.
- Supports controlled and uncontrolled selection. `isIndeterminate` is caller-controlled presentation, not a third stored value; activation requests selected true and the caller clears indeterminate.
- Root is the only accessibility element.
- Sizes: sm, md, lg. No V1 visual variant or color axis.

### Switch

- Parts: Root, Label, Control, Thumb, Description, ErrorMessage.
- Native uses an accessible custom Pressable/View/Reanimated implementation rather than core Switch so its parts, sizes, Uniwind styles, and silhouette can match the shared contract.
- Supports controlled and uncontrolled selection. Root is the only accessibility element.
- Sizes: sm, md, lg. No V1 visual variant or color axis. Start/end content and public animation configuration are excluded.

### Native field-state semantics

- Native Checkbox and Switch support `isReadOnly`, `isRequired`, and `isInvalid` together with `Description` and `ErrorMessage`.
- Readonly controls remain accessibility-focusable but do not change value. Required and invalid states provide visual treatment, React Native accessibility state, and associated text.
- These states do not emulate browser form validation or block an application-level submit action.

### Card

- Parts: Root, Header, Title, Description, Body, Footer.
- V1 Card is a non-interactive content container with no press, selection, or disabled state and no automatic accessibility grouping.
- Variants: surface, elevated, outline.

### Badge

- Badge is a single-root, non-interactive inline status label.
- Meaning must be available as text rather than color alone. When embedded in another accessible control, it can be decorative and its meaning moves into the parent label.
- Variants: solid, soft, outline. Colors: neutral, accent, success, warning, destructive. Sizes: sm, md.

### Divider

- Divider is a single root, decorative by default, with `isDecorative={false}` opting into separator semantics.
- Orientations: horizontal, vertical. Weights: hairline, regular. Arbitrary thickness is not public.

### Spinner

- Spinner is a single root and active whenever mounted; callers unmount it to stop.
- Standalone use requires `label`. Embedded use sets `isDecorative` and leaves busy semantics on the owning component.
- Root owns indeterminate progress semantics; the visual indicator is hidden from accessibility.
- Colors: neutral, accent, success, warning, destructive. Sizes: sm, md, lg.
- Reduced motion replaces continuous rotation with a static or short-opacity alternative.

## Consequences

- Similar component names and state models transfer across platforms while their primitive props and accessibility implementation stay truthful.
- Native implements more behavior for Checkbox and Switch in exchange for visual consistency and compound parts.
- V1 intentionally excludes interactive Card, anchored Badge, Chip/Tag, per-component polymorphism, duplicate state aliases, and public motion configuration.
- ADR-0008 completed the Apple/Emil interactive prototype and accepted B — Precision Workbench as the V1 visual and motion baseline.
- VoiceOver, TalkBack, browser form behavior, keyboard input, dynamic text, and reduced motion require later acceptance tests; types alone do not prove semantic equivalence.
