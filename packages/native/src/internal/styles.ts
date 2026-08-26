import { cn as mergeClassNames, createTV } from "tailwind-variants";
import type { StyleProp } from "react-native";

export const cn = mergeClassNames;
export const tv = createTV({ twMerge: true });

export function mergeStylesWithConsumerOverride<T>(
  generatedStyle: StyleProp<T>,
  consumerStyle: StyleProp<T>
): StyleProp<T> {
  return consumerStyle === undefined ? generatedStyle : [generatedStyle, consumerStyle];
}
