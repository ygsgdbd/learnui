import "@learnui/native";
import "../global.css";

import { Stack } from "expo-router";
import { useCSSVariable } from "uniwind";

export default function RootLayout() {
  const backgroundColor = useCSSVariable("--learnui-color-canvas") as string;
  const foregroundColor = useCSSVariable("--learnui-color-foreground") as string;

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor
        },
        headerLargeTitle: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor
        },
        headerTintColor: foregroundColor,
        title: "LearnUI"
      }}
    />
  );
}
