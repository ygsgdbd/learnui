import { Card, Divider, Spinner } from "@learnui/native";
import { Text, View } from "react-native";

export default function FixtureHomeScreen() {
  const consumerStyle = {
    backgroundColor: "#123456"
  } as const;
  const consumerDividerStyle = {
    borderTopColor: "#2468ac",
    borderTopWidth: 4
  } as const;
  const consumerSpinnerStyle = {
    height: 32,
    opacity: 0.8,
    width: 32
  } as const;

  return (
    <View className="flex-1 items-center justify-center bg-[--learnui-color-canvas] px-6">
      <View
        className="rounded-[--learnui-radius-surface] bg-[--learnui-color-surface] p-6 shadow-[--learnui-shadow-surface]"
        style={consumerStyle}
      >
        <Text className="font-[--learnui-font-sans] text-lg font-semibold text-[--learnui-color-foreground]">
          LearnUI Native Consumer
        </Text>
        <Text className="mt-3 rounded-[--learnui-radius-control] bg-[--learnui-color-accent] px-3 py-2 text-[--learnui-color-accent-foreground]">
          Branded control
        </Text>
        <View className="mt-5 gap-4">
      <Card.Root variant="elevated" className="p-7 border-[--learnui-color-accent]">
        <Card.Header><Card.Title>Consumer Card</Card.Title><Card.Description>Tarball composition</Card.Description></Card.Header>
        <Card.Body><Text>Consumer body</Text></Card.Body><Card.Footer><Text>Consumer footer</Text></Card.Footer>
      </Card.Root>
          <Divider />
          <Divider
            className="border-[--learnui-color-accent]"
            style={consumerDividerStyle}
            weight="regular"
          />
          <Spinner label="Loading fixture" />
          <View accessibilityState={{ busy: true }}>
            <Spinner
              className="h-8 w-8"
              color="accent"
              isDecorative
              style={consumerSpinnerStyle}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
