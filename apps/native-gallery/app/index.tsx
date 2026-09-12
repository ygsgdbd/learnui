import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { ThemePreviewControl } from "../components/theme-preview-control";

export default function HomeScreen() {
  return (
    <View className="flex-1 gap-4 bg-[--learnui-color-canvas] px-6 py-10">
      <Text className="text-3xl font-semibold text-[--learnui-color-foreground]">LearnUI</Text>
      <ThemePreviewControl />
      <Text className="mt-4 text-sm font-semibold uppercase tracking-wider text-[--learnui-color-muted]">
        Components
      </Text>
      <Link asChild href="/components/button">
        <Pressable
          className="min-h-11 justify-center rounded-[--learnui-radius-control] border border-[--learnui-color-border] bg-[--learnui-color-surface] px-4"
          style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}
        >
          <Text className="text-base font-semibold text-[--learnui-color-foreground]">Button</Text>
        </Pressable>
      </Link>
      <Link asChild href="/components/badge">
        <Pressable
          className="min-h-11 justify-center rounded-[var(--learnui-radius-control)] border border-[var(--learnui-color-border)] bg-[var(--learnui-color-surface)] px-4"
          style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}
        >
          <Text className="text-base font-semibold text-[var(--learnui-color-foreground)]">Badge</Text>
        </Pressable>
      </Link>
      <Link asChild href="/components/divider">
        <Pressable
          className="min-h-11 justify-center rounded-[--learnui-radius-control] border border-[--learnui-color-border] bg-[--learnui-color-surface] px-4"
          style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}
        >
          <Text className="text-base font-semibold text-[--learnui-color-foreground]">Divider</Text>
        </Pressable>
      </Link>
      <Link asChild href="/components/card">
        <Pressable className="min-h-11 justify-center rounded-[--learnui-radius-control] border border-[--learnui-color-border] bg-[--learnui-color-surface] px-4">
          <Text className="text-base font-semibold text-[--learnui-color-foreground]">Card</Text>
        </Pressable>
      </Link>
      <Link asChild href="/components/spinner">
        <Pressable
          className="min-h-11 justify-center rounded-[--learnui-radius-control] border border-[--learnui-color-border] bg-[--learnui-color-surface] px-4"
          style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}
        >
          <Text className="text-base font-semibold text-[--learnui-color-foreground]">Spinner</Text>
        </Pressable>
      </Link>
    </View>
  );
}
