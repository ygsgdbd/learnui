import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Uniwind, useUniwind } from "uniwind";

const themeModes = ["system", "light", "dark"] as const;
type ThemeMode = (typeof themeModes)[number];

export default function HomeScreen() {
  const [previewMode, setPreviewMode] = useState<ThemeMode>("system");
  const { theme } = useUniwind();

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
