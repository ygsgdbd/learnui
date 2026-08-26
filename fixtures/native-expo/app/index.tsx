import { Text, View } from "react-native";

export default function FixtureHomeScreen() {
  const consumerStyle = {
    backgroundColor: "#123456"
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
      </View>
    </View>
  );
}
