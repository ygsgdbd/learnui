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

## Card

`Card.Root`, `Card.Header`, `Card.Title`, `Card.Description`, `Card.Body`, and
`Card.Footer` compose a passive container. Root defaults to `variant="surface"`;
`elevated` and `outline` are also available. Every part accepts `className` and
forwards its host ref. Parts may be omitted and children retain their order.
Card does not add press, selection, disabled state or automatic grouping.

Native Title and Description render Text; other parts render View. Put body text
inside Text. Native styles pass through after classes. Title defaults to the
header accessibility role; font scaling is enabled with no line limit. Surface
responds to iOS reduced transparency; Android keeps an explicit border and the
baseline token contrast. No screen-reader or physical-device guarantee is implied
by component tests.
