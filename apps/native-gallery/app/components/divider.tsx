import { ScrollView, Text, View } from "react-native";
import { Divider } from "@learnui/native";

import { ThemePreviewControl } from "../../components/theme-preview-control";

function Specimen({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <View className="gap-3 rounded-[--learnui-radius-surface] bg-[--learnui-color-surface] p-4">
      <Text className="text-sm font-semibold text-[--learnui-color-muted]">{label}</Text>
      {children}
    </View>
  );
}

export default function DividerScreen() {
  return (
    <ScrollView
      className="flex-1 bg-[--learnui-color-canvas]"
      contentContainerClassName="gap-4 px-6 py-8"
    >
      <Text className="text-3xl font-semibold text-[--learnui-color-foreground]">Divider</Text>
      <ThemePreviewControl />

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
