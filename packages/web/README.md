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

## Card

`Card.Root`, `Card.Header`, `Card.Title`, `Card.Description`, `Card.Body`, and
`Card.Footer` compose a passive container. Root defaults to `variant="surface"`;
`elevated` and `outline` are also available. Every part accepts `className` and
forwards its host ref. Parts may be omitted and children retain their order.
Card does not add press, selection, disabled state or automatic grouping.

Web Title renders h3; use aria-level to match the document hierarchy when needed.
Header, Body, Footer and Root render div; Description renders p. No landmarks or
focus stops are added. Styles respect host theme and contrast/transparency
preferences; consumer CSS can override presentation after the learnui layer.
