import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Divider } from "@learnui/native";
import { Uniwind, useUniwind } from "uniwind";

const themeModes = ["system", "light", "dark"] as const;
type ThemeMode = (typeof themeModes)[number];

function Specimen({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <View className="gap-3 rounded-[--learnui-radius-surface] bg-[--learnui-color-surface] p-4">
      <Text className="text-sm font-semibold text-[--learnui-color-muted]">{label}</Text>
      {children}
    </View>
  );
}

export default function DividerScreen() {
  const [previewMode, setPreviewMode] = useState<ThemeMode>("system");
  const { theme } = useUniwind();

  function selectTheme(nextTheme: ThemeMode) {
    setPreviewMode(nextTheme);
    Uniwind.setTheme(nextTheme);
  }

  return (
    <ScrollView
      className="flex-1 bg-[--learnui-color-canvas]"
      contentContainerClassName="gap-4 px-6 py-8"
    >
      <Text className="text-3xl font-semibold text-[--learnui-color-foreground]">Divider</Text>
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

      <Specimen label="Horizontal · hairline (default)">
        <Divider />
      </Specimen>

      <Specimen label="Horizontal · regular · separator semantics">
        <Divider isDecorative={false} weight="regular" />
      </Specimen>

      <Specimen label="Vertical · hairline and regular">
        <View className="h-24 flex-row items-stretch justify-center gap-10">
          <Divider orientation="vertical" />
          <Divider orientation="vertical" weight="regular" />
        </View>
      </Specimen>

      <Specimen label="Consumer className + style override">
        <Divider
          className="border-[--learnui-color-accent]"
          style={{ borderTopWidth: 4, opacity: 0.72 }}
        />
      </Specimen>
    </ScrollView>
  );
}
