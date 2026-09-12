# @learnui/native

React Native package for LearnUI components.

The package is ESM-only and exposes two public entries:

```ts
import "@learnui/native";
```

```css
@import "@learnui/native/styles";
```

Consumers own their Expo, Metro, Tailwind CSS, and Uniwind configuration.

## Badge

Badge is a single React Native `Text` root for non-interactive inline status text. It does not expose press callbacks, Chip actions, or anchored notification positioning.

- `variant`: `solid`, `soft` (default), `outline`.
- `color`: `neutral` (default), `accent`, `success`, `warning`, `destructive`.
- `size`: `sm`, `md` (default).
- `isDecorative`: defaults to `false`. When embedded in an accessible control, set it and include the status meaning in the owner's label.

```tsx
import { useRef } from "react";
import { Pressable, Text } from "react-native";
import { Badge } from "@learnui/native";

function StatusExamples() {
  const badgeRef = useRef<Text>(null);

  return (
    <>
      <Badge color="success" variant="solid" ref={badgeRef}>Approved</Badge>
      <Pressable accessibilityRole="button" accessibilityLabel="Inbox, 3 unread messages">
        <Text>Inbox</Text>
        <Badge color="accent" isDecorative>3 unread</Badge>
      </Pressable>
      <Badge className="rounded-none px-5" style={{ paddingVertical: 8 }}>Custom status</Badge>
    </>
  );
}
```

The ref points to the platform `Text`. Consumer `className` merges last, and native `style` takes precedence over generated presentation. Badge has no fixed height or default line limit, so text can scale and wrap. Text must convey the meaning without relying on color. Verify contrast after overriding semantic theme tokens or styles; VoiceOver, TalkBack, and maximum font scaling still require device acceptance.
