import { forwardRef } from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle
} from "react-native";

import { mergeStylesWithConsumerOverride, tv } from "./internal/styles";

const divider = tv({
  base: "shrink-0 border-[--learnui-color-border]",
  variants: {
    orientation: {
      horizontal: "w-full self-stretch",
      vertical: "h-full self-stretch"
    }
  },
  defaultVariants: {
    orientation: "horizontal"
  }
});

export type DividerOrientation = "horizontal" | "vertical";
export type DividerWeight = "hairline" | "regular";

export interface DividerProps
  extends Omit<
    ViewProps,
    | "accessibilityElementsHidden"
    | "accessibilityRole"
    | "accessible"
    | "aria-hidden"
    | "importantForAccessibility"
    | "role"
    | "style"
  > {
  className?: string;
  isDecorative?: boolean;
  orientation?: DividerOrientation;
  style?: StyleProp<ViewStyle>;
  weight?: DividerWeight;
}

export const Divider = forwardRef<View, DividerProps>(function Divider(
  {
    className,
    isDecorative = true,
    orientation = "horizontal",
    style,
    weight = "hairline",
    ...props
  },
  ref
) {
  const thickness = weight === "hairline" ? StyleSheet.hairlineWidth : 1;
  const generatedStyle: ViewStyle =
    orientation === "horizontal"
      ? { borderTopWidth: thickness }
      : { borderLeftWidth: thickness };
  const { ["aria-hidden"]: _ariaHidden, ...viewProps } = props as ViewProps;

  return (
    <View
      {...viewProps}
      accessibilityElementsHidden={isDecorative}
      accessible={!isDecorative}
      className={divider({ class: className, orientation })}
      importantForAccessibility={isDecorative ? "no-hide-descendants" : "yes"}
      ref={ref}
      role={isDecorative ? undefined : "separator"}
      style={mergeStylesWithConsumerOverride(generatedStyle, style)}
    />
  );
});
