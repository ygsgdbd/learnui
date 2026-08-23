# LearnUI Design Language

## Intent

LearnUI should feel calm, precise, familiar, and responsive. Apple interface craft is a visual and interaction reference, not a requirement to imitate Apple product chrome.

## Principles

1. **Accessible by construction.** Semantics, keyboard behavior, focus, text scaling, and contrast are part of each component API.
2. **Immediate response.** Pressed state starts on pointer or touch down. Avoid artificial delays.
3. **Platform-native behavior.** Web uses browser and React Aria conventions; Native uses React Native conventions.
4. **Composition before configuration.** Multi-part components expose named parts and children rather than accumulating content props.
5. **Simplicity over abstraction.** Share visual intent first. Share runtime code only when repetition proves the need.
6. **Quiet depth.** Use subtle borders, restrained shadows, and translucency only where it communicates hierarchy.

## Foundation tokens

### Theme modes

- Web and Native components support light and dark appearances.
- The host follows the system color scheme by default. An explicit light or dark host override takes precedence.
- Web hosts use a root `data-theme` override; Native hosts use Uniwind's `light`, `dark`, or `system` theme selection.
- Component packages do not provide a ThemeProvider and do not persist the host's selection.
- Component colors use semantic tokens rather than branching on literal colors inside component code.
- Storybook and the Native Gallery expose a manual theme switch so every state can be checked in both appearances.
- V1 has light and dark runtime modes. Consumers may brand both by overriding public tokens; arbitrary named themes are not a V1 contract.

### Token ownership

- `DESIGN.md` defines shared meanings and accepted V1 defaults. Web and Native own separate platform CSS implementations.
- Matching semantics use the same public `--learnui-*` token names on both platforms, while their resolved values may differ.
- A contract test verifies the required public names exist in both packages. V1 does not generate the platform files from a shared runtime or codegen package.
- Public token names are covered by semantic versioning. Removing or renaming one is a breaking change.
- The V1 default values were accepted through the B — Precision Workbench prototype. Device-specific defects may still be corrected during acceptance without changing the public token contract.

### Public theme-token contract

The following table is the exhaustive V1 public-token contract. Consumers may override these tokens; every other foundation value remains internal.

| Token | Meaning | Light default | Dark default |
| --- | --- | --- | --- |
| `--learnui-color-canvas` | Application canvas | `#f5f5f7` | `#000000` |
| `--learnui-color-surface` | Standard material surface | `rgba(255,255,255,0.82)` | `rgba(28,28,30,0.86)` |
| `--learnui-color-elevated` | Opaque elevated surface | `#ffffff` | `#1c1c1e` |
| `--learnui-color-foreground` | Primary text and icon | `#1d1d1f` | `#f5f5f7` |
| `--learnui-color-muted` | Secondary text and icon | `#6e6e73` | `#a1a1a6` |
| `--learnui-color-border` | Standard separator and outline | `rgba(0,0,0,0.10)` | `rgba(255,255,255,0.14)` |
| `--learnui-color-accent` | Primary interactive accent | `#0071e3` | `#0a84ff` |
| `--learnui-color-accent-foreground` | Content on accent | `#ffffff` | `#ffffff` |
| `--learnui-color-destructive` | Destructive status and action | `#d70015` | `#ff453a` |
| `--learnui-color-success` | Success status | `#248a3d` | `#30d158` |
| `--learnui-color-warning` | Warning status | `#a96500` | `#ffb340` |
| `--learnui-color-focus-ring` | Keyboard focus ring | `rgba(8,120,249,.42)` | `rgba(10,132,255,.54)` |
| `--learnui-font-sans` | Platform-oriented sans stack | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` |
| `--learnui-radius-control` | Interactive-control radius | `12px` | `12px` |
| `--learnui-radius-surface` | Card and surface radius | `22px` | `22px` |
| `--learnui-shadow-surface` | Elevated-surface shadow | `0 8px 24px rgba(25,31,40,.08)` | `0 10px 30px rgba(0,0,0,.32)` |

These are the accepted V1 defaults from B — Precision Workbench. Spacing, control heights, the typography size/line-height scale, minimum hit targets, motion physics, gesture thresholds, and structural dimensions are internal invariants rather than stable public tokens.

### Typography

- Font family: platform system font.
- Body: `1rem`, line height `1.5`, neutral tracking.
- Label: `0.875rem`, line height `1.25`, medium weight.
- Title: responsive size, tight leading, about `-0.02em` tracking on Web.
- Native layouts must tolerate system text scaling without clipped labels.

### Shape and spacing

- Spacing follows a 4-point base: `4, 8, 12, 16, 24, 32`.
- Default public control and surface radii are defined by the exhaustive token table above.
- Minimum interactive target: `44 × 44` logical pixels.

### Motion

- Motion decisions follow both `apple-design` and `emil-design-eng`.
- Animate only for feedback, spatial consistency, state explanation, or to prevent a jarring change.
- Pressed feedback is immediate and restrained: scale near `0.98` with a slight opacity change.
- Default transitions are critically damped in spirit, with no decorative bounce.
- Gesture-driven motion must remain interruptible.
- Anchored surfaces enter and exit from their trigger; reversible motion follows a symmetric path.
- Frequently repeated and keyboard-initiated actions avoid motion that delays completion.
- Prefer compositor-friendly transform and opacity; test gesture motion on real iOS and Android devices.
- Reduced-motion users receive opacity or color feedback without spatial movement.

### Accepted V1 motion baseline

- Press feedback begins immediately at pointer/touch down and uses a restrained scale near `0.98` with roughly `140–160ms` visual response.
- Toggle thumb travel uses a critically damped spring with no decorative bounce; interruption retargets from the live position.
- Frequently used controls do not animate on keyboard activation beyond necessary state feedback.
- Pending feedback stays on the owning action and does not introduce a second accessibility focus.
- Reduced motion removes scale and travel, retaining a static state or short opacity/color response.
- Exact platform parameters remain internal and may be corrected by real-device acceptance testing.

## Accepted prototype direction

**B — Precision Workbench** is the V1 direction for component-development surfaces:

- Dense but calm component navigation, a central specimen, and a separate state/token inspector.
- Opaque or near-solid surfaces and explicit borders take priority over decorative glass stacking.
- System typography, strong state labels, semantic blue accent, restrained shadows, and compact spacing establish the LearnUI identity.
- Wide layouts may use rail/specimen/inspector columns; phone layouts fold them into a single readable stack.
- The Workbench is a documentation/development-host direction, not a public component or layout API.

## Component composition

- Simple, single-part controls may expose one root component.
- Multi-part controls use compound components with named parts such as `Root`, `Label`, `Control`, `Indicator`, `Description`, and `ErrorMessage` when those parts are meaningful.
- Compound components use namespace exports such as `TextField.Root`; V1 does not add flat aliases such as `TextFieldRoot`.
- Components accept `children` for content composition instead of adding props such as `headerText`, `footerText`, or `leftContent` for every layout possibility.
- Shared names and core semantics align across Web and Native, while each platform may expose platform-specific parts or props.
- Composition must preserve React Aria Components semantics on Web and React Native accessibility relationships on Native.
- Every public root and part forwards a ref to its underlying platform primitive. V1 adds no custom imperative handles and no cross-platform `as` or `asChild` API.

## V1 component contract

| Component | Structure | Core visual API |
| --- | --- | --- |
| Button | Single root; pending state owns its decorative Spinner | `variant: primary, secondary, outline, ghost, destructive`; `size: sm, md, lg` |
| TextField | `Root`, `Label`, `Input`, `Description`, `ErrorMessage` | `variant: outline, filled`; `size: sm, md, lg` |
| Checkbox | `Root`, `Control`, `Indicator`, `Label`, `Description`, `ErrorMessage` | `size: sm, md, lg` |
| Switch | `Root`, `Label`, `Control`, `Thumb`, `Description`, `ErrorMessage` | `size: sm, md, lg` |
| Card | `Root`, `Header`, `Title`, `Description`, `Body`, `Footer`; non-interactive | `variant: surface, elevated, outline` |
| Badge | Single-root, non-interactive inline status label | `variant: solid, soft, outline`; `color: neutral, accent, success, warning, destructive`; `size: sm, md` |
| Divider | Single root; decorative by default | `orientation: horizontal, vertical`; `weight: hairline, regular` |
| Spinner | Single root; active whenever mounted | `color: neutral, accent, success, warning, destructive`; `size: sm, md, lg` |

- TextField uses `value`, `defaultValue`, and `onChange`. Checkbox and Switch use `isSelected`, `defaultSelected`, and `onSelectedChange`.
- Shared boolean states use `isDisabled`, `isReadOnly`, `isRequired`, and `isInvalid`. V1 does not add DOM-style aliases.
- Button uses `isPending`; pending blocks repeat activation while preserving focus and the action's accessible name.
- Checkbox `isIndeterminate` is a controlled visual state. Activating it requests `onSelectedChange(true)`; the caller clears indeterminate.
- Native Switch is an accessible custom Pressable/View/Reanimated control so its outline and parts can match the shared visual contract.
- Badge is not a Chip, Tag, or anchored notification indicator. Divider semantic exposure is opt-in with `isDecorative={false}`.
- Standalone Spinner requires `label`; embedded busy indicators use `isDecorative` and leave status semantics on their owner.

## Component styling contract

- Public styling axes such as `variant`, `size`, and `color` are finite, semantic, and typed.
- `tailwind-variants`, `tv`, `cn`, variant definitions, slots, and compound rules remain implementation details.
- A simple component accepts `className` on its root. Each public part of a compound component accepts its own `className`.
- V1 does not duplicate compound parts with a centralized `classNames` map.
- Consumer classes merge last and may override presentation, but never behavior or accessibility semantics.
- Web ships a self-contained CSS entry and does not require consumers to scan package internals.
- Native ships a styles entry that self-registers published class sources; the consuming Expo app owns Uniwind and Metro configuration.
- Native animated and gesture-driven values remain in React Native or Reanimated rather than being forced into utility classes.

## Component states

Every interactive component considers: default, hover where applicable, pressed, focus-visible, selected, disabled, invalid, and loading where meaningful.

Focus indicators must be obvious and must not rely on color alone. Disabled state lowers emphasis while preserving readable text.

## Materials

Translucency is reserved for floating or elevated surfaces. Avoid stacking translucent surfaces. When reduced transparency or increased contrast is requested, use a near-solid surface and explicit border.

## Accessibility preferences

- Reduced motion is supported on Web, iOS, and Android.
- Reduced transparency is honored when the browser exposes it and through React Native on iOS. Android materials remain readable without relying on a corresponding system signal.
- High contrast is honored through Web `prefers-contrast` and Android high text contrast. iOS maintains the baseline contrast contract without claiming access to an unavailable React Native signal.
- Reduced-transparency surfaces become near-solid, remove blur, and gain an explicit border.
- Reduced-motion spatial movement becomes a short cross-fade or a static state.
- Dark mode is independent from reduced motion, reduced transparency, and high contrast.

## Platform mapping

| Concern | Web | Native |
| --- | --- | --- |
| Accessibility behavior | React Aria Components | React Native roles, states, labels, and hints |
| Styling | Tailwind CSS v4 and CSS variables | Uniwind, Tailwind CSS v4, and platform-aware tokens |
| Focus | Keyboard-visible focus ring | Platform accessibility focus |
| Hover | Supported for precise pointers | Not treated as a primary state |
| Documentation | Storybook | Expo component gallery |

## First-version scope

Button, TextField, Checkbox, Switch, Card, Badge, Divider, and Spinner form the first shared vocabulary. More complex overlays, collections, and gesture components are deferred until the foundations are verified on both platforms.
