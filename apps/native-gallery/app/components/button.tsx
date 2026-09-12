import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Button, type ButtonSize, type ButtonVariant } from "@learnui/native";
import { useCSSVariable } from "uniwind";

import { ThemePreviewControl } from "../../components/theme-preview-control";
import { useAccessibilityPreferences } from "../../lib/accessibility-preferences";

const variants: ButtonVariant[] = ["primary", "secondary", "outline", "ghost", "destructive"];
const sizes: ButtonSize[] = ["sm", "md", "lg"];

function Specimen({ children, label }: { children: React.ReactNode; label: string }) {
  const surface = useCSSVariable("--learnui-color-elevated") as string;
  const foreground = useCSSVariable("--learnui-color-foreground") as string;
  return (
    <View className="gap-3 rounded-[var(--learnui-radius-surface)] p-4" style={{ backgroundColor: surface }}>
      <Text className="text-base font-semibold" style={{ color: foreground }}>{label}</Text>
      {children}
    </View>
  );
}

export default function ButtonScreen() {
  const [pending, setPending] = useState(false);
  const [saves, setSaves] = useState(0);
  const [presses, setPresses] = useState(0);
  const { isReduceMotionEnabled } = useAccessibilityPreferences();
  const canvas = useCSSVariable("--learnui-color-canvas") as string;
  const foreground = useCSSVariable("--learnui-color-foreground") as string;
  const muted = useCSSVariable("--learnui-color-muted") as string;
  const accentForeground = useCSSVariable("--learnui-color-accent-foreground") as string;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: canvas }} contentContainerClassName="gap-4 px-6 py-8">
      <Text className="text-3xl font-semibold" style={{ color: foreground }}>Button</Text>
      <ThemePreviewControl />
      <Specimen label="Pending · stable action name and one focus target">
        <Button isPending={pending} onPress={() => { setSaves((value) => value + 1); setPending(true); }}>
          Save lesson
        </Button>
        <Button variant="outline" onPress={() => setPending(false)}>Finish saving</Button>
        <Text style={{ color: foreground }} accessibilityLiveRegion="polite">
          {`Save activations: ${saves} · ${pending ? "pending — repeat presses blocked" : "ready"}`}
        </Text>
      </Specimen>
      <Specimen label="Rapid press and system reduced motion">
        <Button onPress={() => setPresses((value) => value + 1)}>Rapid press</Button>
        <Text style={{ color: foreground }}>{`Presses: ${presses}`}</Text>
        <Button variant="ghost" onPress={() => setPresses(0)}>Reset count</Button>
        <Text style={{ color: muted }}>
          Press twenty times and interrupt press/release. Check immediate feedback and final count.
          {isReduceMotionEnabled
            ? " Reduce Motion is enabled: opacity feedback, no scale."
            : " Reduce Motion is disabled: 0.98 scale, 150ms response. Toggle the OS setting while this page remains open."}
        </Text>
      </Specimen>
      <Specimen label="All variants">
        {variants.map((variant) => (
          <Button key={variant} variant={variant} onPress={() => setPresses((value) => value + 1)}>{variant}</Button>
        ))}
      </Specimen>
      <Specimen label="All sizes · minimum 44-point target">
        {sizes.map((size) => <Button key={size} size={size}>{size}</Button>)}
      </Specimen>
      <Specimen label="Disabled and pending">
        <Button isDisabled onPress={() => setPresses((value) => value + 1)}>Disabled action</Button>
        <Button isPending onPress={() => setPresses((value) => value + 1)}>Pending action</Button>
        <Button isDisabled isPending variant="secondary" onPress={() => setPresses((value) => value + 1)}>Disabled pending action</Button>
      </Specimen>
      <Specimen label="Named icon-only action">
        <Button accessibilityLabel="Add lesson" className="self-start" onPress={() => setPresses((value) => value + 1)}>
          <Text accessibilityElementsHidden accessible={false} style={{ color: accentForeground, fontSize: 24 }}>+</Text>
        </Button>
      </Specimen>
      <Specimen label="Consumer classes and press-dependent styles">
        <Button
          className="min-h-20 bg-purple-700"
          style={({ pressed }) => ({ borderRadius: 24, opacity: pressed ? 0.8 : 0.9, transform: [{ rotate: "2deg" }] })}
        >
          Consumer override
        </Button>
        <Text style={{ color: muted }}>Consumer dimensions, color, radius and transform compose with press feedback.</Text>
      </Specimen>
      <Specimen label="Maximum font size and label reflow">
        <Button>Save this long lesson title and continue to the next exercise</Button>
        <Text style={{ color: muted }}>Check maximum Dynamic Type / font and display size, VoiceOver / TalkBack, and light, dark, system themes.</Text>
      </Specimen>
    </ScrollView>
  );
}
