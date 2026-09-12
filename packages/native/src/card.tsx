import { forwardRef, useEffect, useState } from "react";
import { AccessibilityInfo, Text, View, type TextProps, type ViewProps } from "react-native";
import { cn, tv } from "./internal/styles";

export type CardVariant = "surface" | "elevated" | "outline";
export interface CardRootProps extends ViewProps {
  className?: string;
  variant?: CardVariant;
}
export interface CardViewProps extends ViewProps { className?: string }
export interface CardTextProps extends TextProps { className?: string }

const root = tv({
  base: "min-w-0 gap-4 rounded-[--learnui-radius-surface] border border-[--learnui-color-border] p-5",
  variants: { variant: {
    surface: "bg-[--learnui-color-surface]",
    elevated: "bg-[--learnui-color-elevated] shadow-[--learnui-shadow-surface]",
    outline: "bg-transparent"
  } },
  defaultVariants: { variant: "surface" }
});

const Root = forwardRef<View, CardRootProps>(function CardRoot({ className, variant = "surface", ...props }, ref) {
  const [reduceTransparency, setReduceTransparency] = useState(true);
  useEffect(() => {
    let active = true;
    let changed = false;
    void AccessibilityInfo.isReduceTransparencyEnabled().then(value => {
      if (active && !changed) setReduceTransparency(value);
    });
    const subscription = AccessibilityInfo.addEventListener("reduceTransparencyChanged", value => {
      changed = true;
      setReduceTransparency(value);
    });
    return () => { active = false; subscription.remove(); };
  }, []);
  return <View accessible={false} {...props} ref={ref} className={root({ variant,
    class: cn(variant === "surface" && reduceTransparency && "bg-[--learnui-color-elevated]", className)
  })} />;
});
const Header = forwardRef<View, CardViewProps>(function CardHeader({ className, ...props }, ref) {
  return <View {...props} ref={ref} className={cn("min-w-0 gap-1", className)} />;
});
const Title = forwardRef<Text, CardTextProps>(function CardTitle({ className, ...props }, ref) {
  return <Text accessibilityRole="header" {...props} ref={ref} className={cn("text-xl font-semibold text-[--learnui-color-foreground]", className)} />;
});
const Description = forwardRef<Text, CardTextProps>(function CardDescription({ className, ...props }, ref) {
  return <Text {...props} ref={ref} className={cn("text-sm text-[--learnui-color-muted]", className)} />;
});
const Body = forwardRef<View, CardViewProps>(function CardBody({ className, ...props }, ref) {
  return <View {...props} ref={ref} className={cn("min-w-0 gap-3", className)} />;
});
const Footer = forwardRef<View, CardViewProps>(function CardFooter({ className, ...props }, ref) {
  return <View {...props} ref={ref} className={cn("min-w-0 gap-3", className)} />;
});
export const Card = { Root, Header, Title, Description, Body, Footer };
