# LearnUI Context Map

LearnUI has two implementation contexts that share design intent but not rendering primitives.

| Context | Documentation | Responsibility |
| --- | --- | --- |
| Web | `packages/web/CONTEXT.md` | Accessible browser components built with React Aria Components and Tailwind CSS v4 |
| Native | `packages/native/CONTEXT.md` | Accessible iOS and Android components built with React Native and demonstrated through Expo |

The private showcase hosts are `apps/web-storybook` for Web and `apps/native-gallery` for Native. They consume the public component-package entry points and do not define additional component contexts.

System-wide decisions live in `docs/adr/`. Visual decisions and shared tokens are documented in `DESIGN.md`.
