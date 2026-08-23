# ADR-0002: Keep the variant engine internal and publish platform-specific style entries

- Status: Accepted
- Date: 2026-08-23

## Context

LearnUI needs typed visual variants on Web and Native, consumer overrides, and reliable styling after installation from an npm tarball. Tailwind CSS v4 and Uniwind discover and deliver styles differently, while `tailwind-variants` only composes class strings.

Publicly exporting `tv`, `cn`, or variant definitions would couple consumers to an implementation dependency and make future merge-configuration changes harder. Requiring consumers to scan package internals would also make styling depend on package-manager layout.

## Decision

- Both component packages use `tailwind-variants` internally.
- Components expose finite semantic props such as `variant`, `size`, and `color`; slots and compound rules remain internal.
- Simple roots and each public compound part accept `className`. Consumer classes merge last. V1 does not add a parallel `classNames` map.
- `tv`, `cn`, and component variant definitions are not public exports.
- `@learnui/web` publishes a self-contained CSS entry. Consumers do not scan its internal JavaScript.
- `@learnui/native/styles` self-registers the published class source with a relative `@source`. The consuming Expo app owns its global CSS entry and `withUniwindConfig` Metro setup.
- Native animation and gesture values stay in React Native or Reanimated rather than utility classes.

## Consequences

- Consumers learn one semantic component API without depending on the variant engine.
- Web and Native share variant vocabulary while retaining different style-delivery mechanisms.
- Published CSS, source paths, exports, and tarball contents become part of release verification.
- Advanced consumers cannot reuse LearnUI's internal `tv` or merge configuration in V1; a public extension API requires a later decision.
- Consumer overrides can change presentation but must not be treated as a way to replace behavior or accessibility semantics.
