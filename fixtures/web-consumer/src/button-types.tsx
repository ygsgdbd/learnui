import { Button } from "@learnui/web";

// Packed declarations must reject unnamed icon content and unsupported axes.
// @ts-expect-error complex/icon-only children require an accessible name
const unnamed = <Button><svg /></Button>;
// @ts-expect-error unsupported public variant
const invalid = <Button variant="solid">Save</Button>;
const named = <Button aria-label="Add"><svg aria-hidden="true" /></Button>;
const referenced = <Button aria-labelledby="external-label"><svg aria-hidden="true" /></Button>;
void [unnamed, invalid, named, referenced];
