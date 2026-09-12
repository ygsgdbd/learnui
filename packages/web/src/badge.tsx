import { forwardRef, type HTMLAttributes } from "react";

import { tv } from "./internal/styles";

export type BadgeVariant = "solid" | "soft" | "outline";
export type BadgeColor = "neutral" | "accent" | "success" | "warning" | "destructive";
export type BadgeSize = "sm" | "md";

type SpanProps = HTMLAttributes<HTMLSpanElement>;

export interface BadgeProps extends Omit<
  SpanProps,
  | Extract<keyof SpanProps, `on${string}`>
  | "aria-hidden"
  | "color"
  | "contentEditable"
  | "dangerouslySetInnerHTML"
  | "draggable"
  | "role"
  | "tabIndex"
> {
  /** Semantic status color; defaults to neutral. Text must convey the meaning. */
  color?: BadgeColor;
  /** Hide embedded status from accessibility when its owner label supplies the meaning. */
  isDecorative?: boolean;
  /** Defaults to md. */
  size?: BadgeSize;
  /** Defaults to soft. */
  variant?: BadgeVariant;
}

const badge = tv({
  base: "learnui-badge",
  variants: {
    variant: {
      solid: "learnui-badge--solid",
      soft: "learnui-badge--soft",
      outline: "learnui-badge--outline"
    },
    color: {
      neutral: "learnui-badge--neutral",
      accent: "learnui-badge--accent",
      success: "learnui-badge--success",
      warning: "learnui-badge--warning",
      destructive: "learnui-badge--destructive"
    },
    size: { sm: "learnui-badge--sm", md: "learnui-badge--md" }
  },
  defaultVariants: { variant: "soft", color: "neutral", size: "md" }
});

/** Inline status text. Decorative use requires the owner label to convey its meaning. */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, color = "neutral", isDecorative = false, size = "md", variant = "soft", ...props },
  ref
) {
  return (
    <span
      {...props}
      aria-hidden={isDecorative || undefined}
      className={badge({ class: className, color, size, variant })}
      ref={ref}
    />
  );
});
