import { Badge, Button, Card, Divider, Spinner } from "@learnui/native";
import { useRef, useState } from "react";
import { Text, View } from "react-native";

export default function FixtureHomeScreen() {
  const [count, setCount] = useState(0);
  const buttonRef = useRef<View>(null);
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
          <Button ref={buttonRef} onPress={() => setCount(count + 1)}>Save fixture</Button>
          <Text>Press count: {count}</Text>
          <Button isPending>Pending fixture</Button>
          <Button isDisabled>Disabled fixture</Button>
          <Button accessibilityLabel="Add fixture">+</Button>
          <Button variant="outline" size="lg" className="rounded-[22px] px-[30px]" style={{ borderColor: "#13579b" }}>Override fixture</Button>
          <Badge>Pending review</Badge>
          <Badge color="success" variant="solid" size="sm">Approved</Badge>
          <Badge color="warning" variant="outline" className="px-5" style={{ borderRadius: 6 }}>Requires review</Badge>
          <View accessible accessibilityLabel="Inbox, 3 unread messages">
            <Badge isDecorative>3 unread</Badge>
          </View>

          <Card.Root variant="elevated" className="p-7 border-[var(--learnui-color-accent)]">
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
