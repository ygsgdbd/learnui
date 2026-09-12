import { ScrollView, Text } from "react-native";
import { Card } from "@learnui/native";
import { ThemePreviewControl } from "../../components/theme-preview-control";

export default function CardScreen() {
  return <ScrollView className="flex-1 bg-[--learnui-color-canvas]" contentContainerClassName="gap-4 px-6 py-8">
    <Text accessibilityRole="header" className="text-3xl font-semibold text-[--learnui-color-foreground]">Card</Text>
    <ThemePreviewControl />
    {(["surface", "elevated", "outline"] as const).map(variant =>
      <Card.Root key={variant} variant={variant}>
        <Card.Header><Card.Title>{variant} account</Card.Title><Card.Description>Personal details</Card.Description></Card.Header>
        <Card.Body><Text className="text-base text-[--learnui-color-foreground]">Balance available. Content follows the natural reading order.</Text></Card.Body>
        <Card.Footer><Text className="text-sm text-[--learnui-color-muted]">Updated today</Text></Card.Footer>
      </Card.Root>
    )}
    <Card.Root className="border-[--learnui-color-accent] p-6" style={{ borderWidth: 2 }}>
      <Card.Title className="text-2xl">Long content · consumer override</Card.Title>
      <Card.Body><Text className="text-base text-[--learnui-color-foreground]">{"This card omits Header, Description and Footer. Text stays in document order and wraps as the system font size increases. ".repeat(5)}</Text></Card.Body>
    </Card.Root>
    <Card.Root><Text className="text-base text-[--learnui-color-foreground]">Children only — no required parts.</Text></Card.Root>
  </ScrollView>;
}
