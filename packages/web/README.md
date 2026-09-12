# @learnui/web

The Web package for LearnUI.

```ts
import * as LearnUI from "@learnui/web";
import "@learnui/web/styles";
```

The root entry exports the public component API. The `./styles` entry is explicit so consuming applications keep ownership of their CSS pipeline.

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
