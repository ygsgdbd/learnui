import { useState } from "react";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Uniwind, useCSSVariable, useUniwind } from "uniwind";

import {
  resolveAccessibilityPresentation,
  useAccessibilityPreferences
} from "../lib/accessibility-preferences";

const themeModes = ["system", "light", "dark"] as const;
type ThemeMode = (typeof themeModes)[number];

export default function HomeScreen() {
  const [previewMode, setPreviewMode] = useState<ThemeMode>("system");
  const { theme } = useUniwind();
  const preferences = useAccessibilityPreferences();
  const presentation = resolveAccessibilityPresentation(preferences);
  const materialSurface = useCSSVariable(
    presentation.surface === "opaque" ? "--learnui-color-elevated" : "--learnui-color-surface"
  ) as string;

  function selectTheme(nextTheme: ThemeMode) {
    setPreviewMode(nextTheme);
    Uniwind.setTheme(nextTheme);
  }

  return (
    <View className="flex-1 gap-4 bg-[--learnui-color-canvas] px-6 py-10">
      <Text className="text-3xl font-semibold text-[--learnui-color-foreground]">LearnUI</Text>
      <Text className="text-base text-[--learnui-color-muted]">
        Preview: {previewMode} · resolved: {theme}
      </Text>
      <View accessibilityRole="radiogroup" className="flex-row gap-2">
        {themeModes.map((mode) => {
          const isSelected = previewMode === mode;

          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              className={`min-h-11 flex-1 items-center justify-center rounded-[--learnui-radius-control] border px-3 ${
                isSelected
                  ? "border-[--learnui-color-accent] bg-[--learnui-color-accent]"
                  : "border-[--learnui-color-border] bg-[--learnui-color-surface]"
              }`}
              key={mode}
              onPress={() => selectTheme(mode)}
              style={({ pressed }) => ({
                backgroundColor: isSelected ? undefined : materialSurface,
                borderWidth: presentation.surfaceBorder === "explicit" ? 1 : StyleSheet.hairlineWidth,
                opacity: pressed ? 0.82 : 1,
                transform: pressed && presentation.motion === "full" ? [{ scale: 0.98 }] : undefined
              })}
            >
              <Text
                className={
                  isSelected
                    ? "font-semibold capitalize text-[--learnui-color-accent-foreground]"
                    : "font-semibold capitalize text-[--learnui-color-foreground]"
                }
              >
                {mode}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text className="mt-4 text-sm font-semibold uppercase tracking-wider text-[--learnui-color-muted]">
        Components
      </Text>
      <Link asChild href="/components/divider">
        <Pressable
          className="min-h-11 justify-center rounded-[--learnui-radius-control] border border-[--learnui-color-border] bg-[--learnui-color-surface] px-4"
          style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}
        >
          <Text className="text-base font-semibold text-[--learnui-color-foreground]">Divider</Text>
        </Pressable>
      </Link>
    </View>
  );
}
