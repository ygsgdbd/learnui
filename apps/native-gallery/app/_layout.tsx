import "@learnui/native";
import "../global.css";

import { Stack } from "expo-router";
import { useCSSVariable } from "uniwind";

import { ThemePreviewProvider } from "../components/theme-preview-control";

export default function RootLayout() {
  const backgroundColor = useCSSVariable("--learnui-color-canvas") as string;
  const foregroundColor = useCSSVariable("--learnui-color-foreground") as string;

  return (
    <ThemePreviewProvider>
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
    </ThemePreviewProvider>
  );
}
