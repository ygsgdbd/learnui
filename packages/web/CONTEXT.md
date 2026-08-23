# Web Context

## Purpose

`@learnui/web` teaches the construction of accessible, themeable browser components.

## Vocabulary

- **Primitive:** a React Aria Component that owns behavior and accessibility.
- **LearnUI component:** the styled public wrapper exported by this package.
- **Compound component:** a LearnUI component whose named public parts compose structure and share state without a monolithic content-prop API.
- **Part:** a named public child of a compound component that owns a specific semantic or structural role and forwards its platform ref.
- **Variant:** a finite, semantic visual option exposed by a LearnUI component; it does not expose the underlying class-composition engine.
- **Consumer:** an external application that installs the packed component package and uses only its public exports.
- **Consumer fixture:** a minimal application copied outside the workspace to verify the packed package without source aliases or workspace links.
- **Theme mode:** the system, light, or dark appearance selected by the host and consumed through semantic component tokens.
- **Public token:** a stable, namespaced semantic variable a consumer may override without replacing component behavior or accessibility invariants.
- **Badge:** a non-interactive inline status label; it is not an anchored notification indicator or actionable Chip.
- **Pending:** a Button state that prevents repeat activation while preserving focus and the action's accessible name.
- **Release gate:** a mandatory evidence condition that must pass before a candidate can be published; a weaker check cannot substitute for it.
- **Acceptance record:** a versioned QA artifact that identifies the build, environment, reviewer, checklist results, and linked exceptions for a release candidate.
- **Story:** an executable example and visual state fixture in Storybook.

## Boundaries

- React Aria Components owns behavior and browser semantics.
- Tailwind CSS v4 and CSS variables own presentation.
- Storybook is the documentation and manual test surface.
- Do not import React Native code.
