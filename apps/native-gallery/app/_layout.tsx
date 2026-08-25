import "@learnui/native";
import "../global.css";

import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: "#f5f5f7"
        },
        headerLargeTitle: true,
        headerShadowVisible: false,
        title: "LearnUI"
      }}
    />
  );
}
