import { View } from "react-native";
import { Button } from "@learnui/native";

<Button onPress={() => {}}>Save lesson</Button>;
<Button accessibilityLabel="Add lesson"><View /></Button>;
// @ts-expect-error Non-text children require an explicit accessible name.
<Button><View /></Button>;
// @ts-expect-error The platform disabled alias is owned by isDisabled.
<Button disabled>Save</Button>;
// @ts-expect-error Button has a finite public variant axis.
<Button variant="solid">Save</Button>;
