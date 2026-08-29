import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Uniwind, useCSSVariable, useUniwind } from "uniwind";

import {
  resolveAccessibilityPresentation,
  useAccessibilityPreferences
} from "../lib/accessibility-preferences";

const themeModes = ["system", "light", "dark"] as const;
type ThemeMode = (typeof themeModes)[number];

interface ThemePreviewContextValue {
  previewMode: ThemeMode;
  selectTheme: (theme: ThemeMode) => void;
}

const ThemePreviewContext = createContext<ThemePreviewContextValue | null>(null);

export function ThemePreviewProvider({ children }: { children: ReactNode }) {
  const [previewMode, setPreviewMode] = useState<ThemeMode>("system");
  const value = useMemo(
    () => ({
      previewMode,
      selectTheme(nextTheme: ThemeMode) {
        setPreviewMode(nextTheme);
        Uniwind.setTheme(nextTheme);
      }
    }),
    [previewMode]
  );

  return <ThemePreviewContext value={value}>{children}</ThemePreviewContext>;
}

function useThemePreview() {
  const value = useContext(ThemePreviewContext);

  if (value === null) {
    throw new Error("ThemePreviewControl must be rendered inside ThemePreviewProvider");
  }

  return value;
}

export function ThemePreviewControl() {
  const { previewMode, selectTheme } = useThemePreview();
  const { theme } = useUniwind();
  const preferences = useAccessibilityPreferences();
  const presentation = resolveAccessibilityPresentation(preferences);
  const materialSurface = useCSSVariable(
    presentation.surface === "opaque" ? "--learnui-color-elevated" : "--learnui-color-surface"
  ) as string;
  const accentColor = useCSSVariable("--learnui-color-accent") as string;
  const accentForegroundColor = useCSSVariable("--learnui-color-accent-foreground") as string;
  const borderColor = useCSSVariable("--learnui-color-border") as string;
  const foregroundColor = useCSSVariable("--learnui-color-foreground") as string;
  const mutedColor = useCSSVariable("--learnui-color-muted") as string;

  return (
    <View className="gap-4">
      <Text className="text-base" style={{ color: mutedColor }}>
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
                backgroundColor: isSelected ? accentColor : materialSurface,
                borderColor: isSelected ? accentColor : borderColor,
                borderWidth: presentation.surfaceBorder === "explicit" ? 1 : StyleSheet.hairlineWidth,
                opacity: pressed ? 0.82 : 1
              })}
            >
              <Text
                className={
                  isSelected
                    ? "font-semibold capitalize text-[--learnui-color-accent-foreground]"
                  : "font-semibold capitalize text-[--learnui-color-foreground]"
                }
                style={{ color: isSelected ? accentForegroundColor : foregroundColor }}
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
