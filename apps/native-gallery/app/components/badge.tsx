import { Pressable, ScrollView, Text, View } from "react-native";
import { Badge, type BadgeColor, type BadgeVariant } from "@learnui/native";

import { ThemePreviewControl } from "../../components/theme-preview-control";

const statuses: { color: BadgeColor; label: string }[] = [
  { color: "neutral", label: "Draft" },
  { color: "accent", label: "In review" },
  { color: "success", label: "Approved" },
  { color: "warning", label: "Needs attention" },
  { color: "destructive", label: "Failed" }
];
const variants: BadgeVariant[] = ["solid", "soft", "outline"];

export default function BadgeScreen() {
  return (
    <ScrollView
      className="flex-1 bg-[--learnui-color-canvas]"
      contentContainerClassName="gap-4 px-6 py-8"
    >
      <Text className="text-3xl font-semibold text-[--learnui-color-foreground]">Badge</Text>
      <ThemePreviewControl />
      <Text className="text-base text-[--learnui-color-foreground]">
        Status stays meaningful without color. Try maximum text size in each theme.
      </Text>
      {variants.map((variant) => (
        <View key={variant} className="gap-3 rounded-[--learnui-radius-surface] bg-[--learnui-color-surface] p-4">
          <Text className="text-sm font-semibold text-[--learnui-color-muted]">{variant}</Text>
          <View className="flex-row flex-wrap items-start gap-2">
            {statuses.map(({ color, label }) => (
              <Badge color={color} key={color} variant={variant}>{label}</Badge>
            ))}
          </View>
        </View>
      ))}
      <View className="gap-3">
        <Text className="text-sm font-semibold text-[--learnui-color-muted]">Sizes · small and medium</Text>
        <Badge size="sm">Draft · small</Badge>
        <Badge size="md">Draft · medium</Badge>
        <Badge color="warning">Needs attention before the next scheduled release</Badge>
      </View>
      <View className="gap-3">
        <Text className="text-sm font-semibold text-[--learnui-color-muted]">Decorative embedding · owner provides the meaning</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Inbox, 3 unread messages"
          className="min-h-11 flex-row flex-wrap items-center gap-3 rounded-[--learnui-radius-control] border border-[--learnui-color-border] p-3"
        >
          <Text className="text-base text-[--learnui-color-foreground]">Inbox</Text>
          <Badge color="accent" isDecorative>3 unread</Badge>
        </Pressable>
      </View>
      <View className="gap-3">
        <Text className="text-sm font-semibold text-[--learnui-color-muted]">Consumer className + style override</Text>
        <Badge className="rounded-none px-5" style={{ borderWidth: 2, borderColor: "#6750a4", paddingVertical: 8 }}>
          Custom status
        </Badge>
      </View>
    </ScrollView>
  );
}
