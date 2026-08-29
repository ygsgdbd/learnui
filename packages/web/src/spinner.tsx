import { forwardRef, type CSSProperties } from "react";
import {
  ProgressBar as AriaProgressBar,
  type ProgressBarProps as AriaProgressBarProps
} from "react-aria-components";

import { tv } from "./internal/styles";

export type SpinnerColor =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "destructive";
export type SpinnerSize = "sm" | "md" | "lg";

interface SpinnerSharedProps
  extends Omit<
    AriaProgressBarProps,
    | "aria-hidden"
    | "aria-label"
    | "aria-labelledby"
    | "aria-valuemax"
    | "aria-valuemin"
    | "aria-valuenow"
    | "aria-valuetext"
    | "children"
    | "className"
    | "formatOptions"
    | "isIndeterminate"
    | "maxValue"
    | "minValue"
    | "render"
    | "role"
    | "style"
    | "value"
    | "valueLabel"
  > {
  className?: string;
  color?: SpinnerColor;
  size?: SpinnerSize;
  style?: CSSProperties;
}

export type SpinnerProps = SpinnerSharedProps &
  (
    | {
        isDecorative: true;
        label?: never;
      }
    | {
        isDecorative?: false;
        label: string;
      }
  );

const spinner = tv({
  base: "learnui-spinner",
  variants: {
    color: {
      neutral: "learnui-spinner--neutral",
      accent: "learnui-spinner--accent",
      success: "learnui-spinner--success",
      warning: "learnui-spinner--warning",
      destructive: "learnui-spinner--destructive"
    },
    size: {
      sm: "learnui-spinner--sm",
      md: "learnui-spinner--md",
      lg: "learnui-spinner--lg"
    }
  },
  defaultVariants: {
    color: "neutral",
    size: "md"
  }
});

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(function Spinner(
  {
    className,
    color = "neutral",
    isDecorative = false,
    label,
    size = "md",
    slot,
    ...props
  },
  ref
) {
  const spinnerClassName = spinner({ class: className, color, size });
  const indicator = <span aria-hidden="true" className="learnui-spinner__indicator" />;

  if (isDecorative) {
    return (
      <div
        {...props}
        aria-hidden="true"
        className={spinnerClassName}
        ref={ref}
        role="presentation"
        slot={slot ?? undefined}
      >
        {indicator}
      </div>
    );
  }

  return (
    <AriaProgressBar
      {...props}
      aria-label={label}
      className={spinnerClassName}
      isIndeterminate
      ref={ref}
      slot={slot}
    >
      {indicator}
    </AriaProgressBar>
  );
});
