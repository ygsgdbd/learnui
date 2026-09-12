import { forwardRef } from "react";
import { Text, type TextProps } from "react-native";

import { tv } from "./internal/styles";

const badge = tv({
  base: "self-start shrink rounded-[var(--learnui-radius-control)] font-[family-name:var(--learnui-font-sans)] font-semibold",
  variants: {
    variant: {
      solid: "text-[var(--lui-badge-solid-foreground)]",
      soft: "text-[var(--learnui-color-foreground)]",
      outline: "border bg-transparent text-[var(--learnui-color-foreground)]"
    },
    color: { neutral: "", accent: "", success: "", warning: "", destructive: "" },
    size: { sm: "px-2 py-0.5 text-xs", md: "px-2.5 py-1 text-sm" }
  },
  compoundVariants: [
    { variant: "solid", color: "neutral", class: "bg-[var(--learnui-color-foreground)] text-[var(--learnui-color-canvas)]" },
    { variant: "solid", color: "accent", class: "bg-[var(--learnui-color-accent)]" },
    { variant: "solid", color: "success", class: "bg-[var(--learnui-color-success)] text-[var(--lui-badge-success-solid-foreground)]" },
    { variant: "solid", color: "warning", class: "bg-[var(--learnui-color-warning)]" },
    { variant: "solid", color: "destructive", class: "bg-[var(--learnui-color-destructive)]" },
    { variant: "soft", color: "neutral", class: "bg-[var(--learnui-color-foreground)]/10" },
    { variant: "soft", color: "accent", class: "bg-[var(--learnui-color-accent)]/10" },
    { variant: "soft", color: "success", class: "bg-[var(--learnui-color-success)]/10" },
    { variant: "soft", color: "warning", class: "bg-[var(--learnui-color-warning)]/10" },
    { variant: "soft", color: "destructive", class: "bg-[var(--learnui-color-destructive)]/10" },
    { variant: "outline", color: "neutral", class: "border-[var(--learnui-color-foreground)]" },
    { variant: "outline", color: "accent", class: "border-[var(--learnui-color-accent)]" },
    { variant: "outline", color: "success", class: "border-[var(--learnui-color-success)]" },
    { variant: "outline", color: "warning", class: "border-[var(--learnui-color-warning)]" },
    { variant: "outline", color: "destructive", class: "border-[var(--learnui-color-destructive)]" }
  ],
  defaultVariants: { variant: "soft", color: "neutral", size: "md" }
});

export type BadgeVariant = "solid" | "soft" | "outline";
export type BadgeColor = "neutral" | "accent" | "success" | "warning" | "destructive";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends Omit<TextProps,
  | "onPress" | "onLongPress" | "onPressIn" | "onPressOut"
  | "accessibilityRole" | "role" | "accessible" | "focusable"
  | "accessibilityElementsHidden" | "importantForAccessibility" | "aria-hidden"
> {
  className?: string;
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: BadgeSize;
  isDecorative?: boolean;
}

export const Badge = forwardRef<Text, BadgeProps>(function Badge(
  { className, color = "neutral", variant = "soft", size = "md", isDecorative = false, style, ...props },
  ref
) {
  const { ["aria-hidden"]: _ariaHidden, ...textProps } = props as TextProps;

  return (
    <Text
      {...textProps}
      accessibilityRole={undefined}
      role={undefined}
      accessible={!isDecorative}
      accessibilityElementsHidden={isDecorative}
      importantForAccessibility={isDecorative ? "no-hide-descendants" : "yes"}
      className={badge({ class: className, color, variant, size })}
      ref={ref}
      style={style}
    />
  );
});
