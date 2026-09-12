import { Button } from "@learnui/native";
import { View } from "react-native";

// @ts-expect-error complex/icon-only children require an accessible name
const unnamed = <Button><View /></Button>;
// @ts-expect-error unsupported public variant
const invalid = <Button variant="solid">Save</Button>;
const named = <Button accessibilityLabel="Add"><View /></Button>;
void [unnamed, invalid, named];
