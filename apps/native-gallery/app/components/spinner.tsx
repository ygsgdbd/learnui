import { ScrollView, Text, View } from "react-native";
import {
  Spinner,
  type SpinnerColor,
  type SpinnerSize
} from "@learnui/native";

import { ThemePreviewControl } from "../../components/theme-preview-control";
import { useAccessibilityPreferences } from "../../lib/accessibility-preferences";

const colors: SpinnerColor[] = [
  "neutral",
  "accent",
  "success",
  "warning",
  "destructive"
];
const sizes: SpinnerSize[] = ["sm", "md", "lg"];

function Specimen({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <View className="gap-3 rounded-[--learnui-radius-surface] bg-[--learnui-color-surface] p-4">
      <Text className="text-sm font-semibold text-[--learnui-color-muted]">{label}</Text>
      {children}
    </View>
  );
}

export default function SpinnerScreen() {
  const { isReduceMotionEnabled } = useAccessibilityPreferences();

  return (
    <ScrollView
      className="flex-1 bg-[--learnui-color-canvas]"
      contentContainerClassName="gap-4 px-6 py-8"
    >
      <Text className="text-3xl font-semibold text-[--learnui-color-foreground]">Spinner</Text>
      <ThemePreviewControl />

      <Specimen label="Standalone progress semantics">
        <Spinner color="accent" label="Loading lessons" />
      </Specimen>

      <Specimen label="Embedded decorative · busy semantics stay on owner">
        <View
          accessibilityLabel="Saving lesson"
          accessibilityRole="button"
          accessibilityState={{ busy: true }}
          accessible
          className="min-h-11 flex-row items-center gap-3 rounded-[--learnui-radius-control] border border-[--learnui-color-border] bg-[--learnui-color-surface] px-4"
        >
          <Spinner color="accent" isDecorative size="sm" />
          <Text className="font-semibold text-[--learnui-color-foreground]">Save lesson</Text>
        </View>
      </Specimen>

      <Specimen label="Colors">
        <View className="flex-row flex-wrap items-center gap-5">
          {colors.map((color) => (
            <View className="items-center gap-2" key={color}>
              <Spinner color={color} label={`${color} loading`} />
              <Text className="text-xs text-[--learnui-color-muted]">{color}</Text>
            </View>
          ))}
        </View>
      </Specimen>

      <Specimen label="Sizes">
        <View className="flex-row items-center gap-8">
          {sizes.map((size) => (
            <View className="items-center gap-2" key={size}>
              <Spinner color="accent" label={`${size} loading`} size={size} />
              <Text className="text-xs text-[--learnui-color-muted]">{size}</Text>
            </View>
          ))}
        </View>
      </Specimen>

      <Specimen label="System reduced motion">
        <View className="flex-row items-center gap-3">
          <Spinner color="success" label="Checking accessibility preference" />
          <Text className="flex-1 text-sm text-[--learnui-color-foreground]">
            {isReduceMotionEnabled
              ? "Enabled · continuous rotation is replaced by a static indicator."
              : "Disabled · continuous rotation runs on the native animation driver."}
          </Text>
        </View>
      </Specimen>

      <Specimen label="Consumer className + style override">
        <Spinner
          className="h-10 w-10 self-end"
          color="warning"
          label="Loading with consumer overrides"
          style={{ opacity: 0.6 }}
        />
      </Specimen>
    </ScrollView>
  );
}
