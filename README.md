# LearnUI

LearnUI is a PNPM monorepo for learning how accessible component libraries are designed, implemented, documented, and tested across Web and React Native.

## Workspaces

- `@learnui/web`: React Aria Components + Tailwind CSS v4, documented with Storybook.
- `@learnui/native`: Expo + React Native components with an in-app component gallery.

## Commands

```bash
pnpm install
pnpm --filter @learnui/web-storybook test:install-browsers
pnpm storybook
pnpm native
pnpm typecheck
pnpm test
pnpm build
```

The Playwright browser installation is required once before running the browser-backed Storybook tests included in `pnpm test`.

See `DESIGN.md` for the visual language and `CONTEXT-MAP.md` for platform boundaries.
