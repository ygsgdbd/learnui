import { forwardRef, useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle
} from "react-native";
import { useCSSVariable } from "uniwind";

import { tv } from "./internal/styles";

const spinner = tv({
  base: "items-center justify-center",
  variants: {
    size: {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6"
    }
  },
  defaultVariants: {
    size: "md"
  }
});

const indicator = tv({
  base: "h-full w-full rounded-full border-2 border-b-transparent border-l-transparent"
});

export type SpinnerColor = "neutral" | "accent" | "success" | "warning" | "destructive";
export type SpinnerSize = "sm" | "md" | "lg";

const spinnerColorVariables: Record<SpinnerColor, string> = {
  neutral: "--learnui-color-muted",
  accent: "--learnui-color-accent",
  success: "--learnui-color-success",
  warning: "--learnui-color-warning",
  destructive: "--learnui-color-destructive"
};

interface SpinnerBaseProps
  extends Omit<
    ViewProps,
    | "accessibilityElementsHidden"
    | "accessibilityLabel"
    | "accessibilityRole"
    | "accessibilityState"
    | "accessibilityValue"
    | "accessible"
    | "aria-busy"
    | "aria-hidden"
    | "aria-label"
    | "aria-valuemax"
    | "aria-valuemin"
    | "aria-valuenow"
    | "aria-valuetext"
    | "importantForAccessibility"
    | "role"
    | "style"
  > {
  className?: string;
  color?: SpinnerColor;
  size?: SpinnerSize;
  style?: StyleProp<ViewStyle>;
}

export type SpinnerProps = SpinnerBaseProps &
  (
    | { isDecorative: true; label?: never }
    | { isDecorative?: false; label: string }
  );

export const Spinner = forwardRef<View, SpinnerProps>(function Spinner(
  {
    className,
    color = "neutral",
    isDecorative = false,
    label,
    size = "md",
    style,
    ...props
  },
  ref
) {
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState<boolean | null>(null);
  const rotation = useRef(new Animated.Value(0)).current;
  const indicatorColor = useCSSVariable(
    spinnerColorVariables[color]
  ) as ViewStyle["borderTopColor"];

  useEffect(() => {
    let isMounted = true;
    let livePreference: boolean | undefined;

    void AccessibilityInfo.isReduceMotionEnabled().then((isEnabled) => {
      if (isMounted && livePreference === undefined) setIsReduceMotionEnabled(isEnabled);
    });

    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", (isEnabled) => {
      livePreference = isEnabled;
      setIsReduceMotionEnabled(isEnabled);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (isReduceMotionEnabled !== false) {
      rotation.stopAnimation();
      rotation.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.timing(rotation, {
        duration: 800,
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: true
      })
    );
    animation.start();

    return () => animation.stop();
  }, [isReduceMotionEnabled, rotation]);

  const indicatorStyle: ViewStyle =
    isReduceMotionEnabled === false
      ? {
          height: "100%",
          transform: [
            {
              rotate: rotation.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "360deg"]
              })
            }
          ],
          width: "100%"
        }
      : { height: "100%", opacity: 0.72, width: "100%" };
  const {
    accessibilityElementsHidden: _accessibilityElementsHidden,
    accessibilityLabel: _accessibilityLabel,
    accessibilityRole: _accessibilityRole,
    accessibilityState: _accessibilityState,
    accessibilityValue: _accessibilityValue,
    accessible: _accessible,
    ["aria-busy"]: _ariaBusy,
    ["aria-hidden"]: _ariaHidden,
    ["aria-label"]: _ariaLabel,
    ["aria-valuemax"]: _ariaValueMax,
    ["aria-valuemin"]: _ariaValueMin,
    ["aria-valuenow"]: _ariaValueNow,
    ["aria-valuetext"]: _ariaValueText,
    importantForAccessibility: _importantForAccessibility,
    role: _role,
    ...viewProps
  } = props as ViewProps;

  return (
    <View
      {...viewProps}
      accessibilityElementsHidden={isDecorative}
      accessibilityLabel={isDecorative ? undefined : label}
      accessibilityRole={isDecorative ? undefined : "progressbar"}
      accessibilityState={isDecorative ? undefined : { busy: true }}
      accessible={!isDecorative}
      className={spinner({ class: className, size })}
      importantForAccessibility={isDecorative ? "no-hide-descendants" : "yes"}
      ref={ref}
      style={style}
    >
      <Animated.View
        accessibilityElementsHidden
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={indicatorStyle}
      >
        <View
          className={indicator()}
          style={{
            borderBottomColor: "transparent",
            borderLeftColor: "transparent",
            borderRightColor: indicatorColor,
            borderTopColor: indicatorColor
          }}
        />
      </Animated.View>
    </View>
  );
});
