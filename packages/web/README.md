# @learnui/web

The Web package for LearnUI.

```ts
import * as LearnUI from "@learnui/web";
import "@learnui/web/styles";
```

The root entry exports the public component API. The `./styles` entry is explicit so consuming applications keep ownership of their CSS pipeline.

## Badge

`Badge` renders a non-interactive inline `span` and forwards an `HTMLSpanElement` ref.
Its defaults are `variant="soft"`, `color="neutral"`, and `size="md"`.
Variants are `solid`, `soft`, and `outline`; colors are `neutral`, `accent`,
`success`, `warning`, and `destructive`; sizes are `sm` and `md`.
Consumer `className` merges last, and `style` remains a presentation escape hatch.
Badge has no press, selection, removal, or anchored-notification API.

Use visible text to communicate status. When embedded in an accessible control,
set `isDecorative` and include that meaning in the owner's accessible label:

```tsx
import { Badge } from "@learnui/web";

<Badge color="success">Published</Badge>
<button aria-label="Inbox, 3 unread messages" type="button">
  Inbox <Badge isDecorative>3 unread</Badge>
</button>
```

Decorative badges are hidden from accessibility. Badge itself adds no keyboard
focus target or live announcement; the host owns dynamic announcements when needed.
