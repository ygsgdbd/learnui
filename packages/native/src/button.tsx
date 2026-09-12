import { forwardRef, useEffect, useRef, useState, type ReactNode } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type View
} from "react-native";

import { Spinner } from "./spinner";
import { tv } from "./internal/styles";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

const button = tv({
  base: "min-w-11 flex-row items-center justify-center gap-2 rounded-[var(--learnui-radius-control)] border",
  variants: {
    variant: {
      primary: "border-transparent bg-[var(--lui-button-primary-background)]",
      secondary: "border-transparent bg-[var(--learnui-color-surface)]",
      outline: "border-[color:var(--learnui-color-border)] bg-transparent",
      ghost: "border-transparent bg-transparent",
      destructive: "border-transparent bg-[var(--lui-button-destructive-background)]"
    },
    size: { sm: "min-h-11 px-3 py-2", md: "min-h-12 px-4 py-3", lg: "min-h-14 px-6 py-4" }
  },
  defaultVariants: { variant: "primary", size: "md" }
});

const label = tv({
  base: "shrink text-center font-[family-name:var(--learnui-font-sans)] font-semibold",
  variants: {
    variant: {
      primary: "text-[color:var(--learnui-color-accent-foreground)]",
      secondary: "text-[color:var(--learnui-color-foreground)]",
      outline: "text-[color:var(--learnui-color-foreground)]",
      ghost: "text-[color:var(--lui-button-ghost-foreground)]",
      destructive: "text-[color:var(--learnui-color-accent-foreground)]"
    },
    size: { sm: "text-sm", md: "text-base", lg: "text-lg" }
  }
});

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonBaseProps extends Omit<PressableProps,
  | "disabled"
  | "children"
  | "accessibilityLabel"
  | "accessibilityRole"
  | "accessibilityState"
  | "accessible"
  | "role"
  | "aria-label"
  | "aria-disabled"
  | "aria-busy"
  | "unstable_pressDelay"
> {
  isDisabled?: boolean;
  isPending?: boolean;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export type ButtonProps = ButtonBaseProps & (
  | { children: string | number; accessibilityLabel?: string }
  | { children: ReactNode; accessibilityLabel: string }
);

export const Button = forwardRef<View, ButtonProps>(function Button(
  {
    accessibilityLabel,
    children,
    className,
    isDisabled = false,
    isPending = false,
    onAccessibilityAction,
    onAccessibilityTap,
    onMagicTap,
    onPress,
    onLongPress,
    onPressIn,
    onPressOut,
    size = "md",
    style,
    variant = "primary",
    ...props
  },
  ref
) {
  const [pressed, setPressed] = useState(false);
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  const scale = useRef(new Animated.Value(1)).current;
  const isUnavailable = isDisabled || isPending;
  const isPressed = pressed && !isUnavailable;

  useEffect(() => {
    let mounted = true;
    let livePreference: boolean | undefined;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted && livePreference === undefined) setReduceMotion(value);
    });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", (value) => {
      livePreference = value;
      setReduceMotion(value);
    });
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (isUnavailable) setPressed(false);
  }, [isUnavailable]);

  useEffect(() => {
    if (reduceMotion !== false) {
      scale.stopAnimation();
      scale.setValue(1);
      return;
    }
    const animation = Animated.timing(scale, {
      toValue: isPressed ? 0.98 : 1,
      duration: 150,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    });
    animation.start();
    return () => animation.stop();
  }, [isPressed, reduceMotion, scale]);

  const consumerStyle = StyleSheet.flatten(
    typeof style === "function" ? style({ pressed: isPressed }) : style
  );
  // Array transforms compose with feedback; a consumer string transform is an explicit replacement.
  const transform = reduceMotion === false && typeof consumerStyle?.transform !== "string"
    ? [...(consumerStyle?.transform ?? []), { scale }]
    // Keep a valid transform shape when detaching the animated value on a live preference change.
    : consumerStyle?.transform ?? [{ scale: 1 }];
  const feedbackOpacity = isDisabled ? 0.5 : isPressed ? 0.86 : 1;
  const opacity = typeof consumerStyle?.opacity === "number"
    ? consumerStyle.opacity * feedbackOpacity
    : consumerStyle?.opacity ?? (feedbackOpacity === 1 ? undefined : feedbackOpacity);
  const isText = typeof children === "string" || typeof children === "number";
  if (__DEV__ && !(accessibilityLabel?.trim() || (isText && String(children).trim()))) {
    throw new Error("Button requires a non-empty accessibilityLabel for non-text children.");
  }
  const {
    disabled: _disabled,
    role: _role,
    accessibilityRole: _accessibilityRole,
    accessibilityState: _accessibilityState,
    accessible: _accessible,
    "aria-label": _ariaLabel,
    "aria-disabled": _ariaDisabled,
    "aria-busy": _ariaBusy,
    unstable_pressDelay: _pressDelay,
    ...pressableProps
  } = props as PressableProps;
  return (
    <AnimatedPressable
      {...pressableProps}
      accessibilityLabel={accessibilityLabel?.trim() || undefined}
      accessibilityRole="button"
      accessibilityState={{ busy: isPending, disabled: isDisabled }}
      accessible
      className={button({ class: className, size, variant })}
      disabled={isDisabled}
      onAccessibilityAction={onAccessibilityAction ? (event) => {
        if (!isUnavailable) onAccessibilityAction(event);
      } : undefined}
      onAccessibilityTap={onAccessibilityTap ? () => {
        if (!isUnavailable) onAccessibilityTap();
      } : undefined}
      onMagicTap={onMagicTap ? () => {
        if (!isUnavailable) onMagicTap();
      } : undefined}
      onPressIn={(event) => {
        if (isUnavailable) return;
        setPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        if (!isUnavailable) onPressOut?.(event);
      }}
      onLongPress={(event) => {
        if (!isUnavailable) onLongPress?.(event);
      }}
      onPress={(event) => {
        if (!isUnavailable) onPress?.(event);
      }}
      ref={ref}
      style={[consumerStyle, { opacity, transform }]}
    >
      {isPending && (
        <Spinner className="h-6 w-6 rounded-full bg-[var(--learnui-color-elevated)] p-1" isDecorative size="sm" />
      )}
      {isText ? <Text className={label({ size, variant })}>{children}</Text> : children}
    </AnimatedPressable>
  );
});
