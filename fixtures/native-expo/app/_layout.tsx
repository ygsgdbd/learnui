import "@learnui/native";
import "../global.css";

import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack screenOptions={{ title: "LearnUI Consumer" }} />;
}
