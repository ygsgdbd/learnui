import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Uniwind, useCSSVariable, useUniwind } from "uniwind";

import {
  resolveAccessibilityPresentation,
  useAccessibilityPreferences
} from "../lib/accessibility-preferences";

const themeModes = ["system", "light", "dark"] as const;
type ThemeMode = (typeof themeModes)[number];

export function ThemePreviewControl() {
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
    <View className="gap-4">
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
    </View>
  );
}
