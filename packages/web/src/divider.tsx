import { forwardRef, type ForwardedRef } from "react";
import {
  Separator as AriaSeparator,
  type SeparatorProps as AriaSeparatorProps
} from "react-aria-components";

import { tv } from "./internal/styles";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerWeight = "hairline" | "regular";

export interface DividerProps extends Omit<
  AriaSeparatorProps,
  | "aria-hidden"
  | "aria-orientation"
  | "className"
  | "elementType"
  | "orientation"
  | "render"
  | "role"
> {
  className?: string;
  isDecorative?: boolean;
  orientation?: DividerOrientation;
  weight?: DividerWeight;
}

const divider = tv({
  base: "learnui-divider",
  variants: {
    orientation: {
      horizontal: "learnui-divider--horizontal",
      vertical: "learnui-divider--vertical"
    },
    weight: {
      hairline: "learnui-divider--hairline",
      regular: "learnui-divider--regular"
    }
  },
  defaultVariants: {
    orientation: "horizontal",
    weight: "hairline"
  }
});

export const Divider = forwardRef<HTMLElement, DividerProps>(function Divider(
  {
    className,
    isDecorative = true,
    orientation = "horizontal",
    slot,
    weight = "hairline",
    ...props
  },
  ref
) {
  const dividerClassName = divider({ class: className, orientation, weight });

  if (isDecorative) {
    const decorativeProps = {
      ...props,
      "aria-hidden": true,
      className: dividerClassName,
      role: "presentation" as const,
      slot: slot ?? undefined
    };

    return orientation === "horizontal" ? (
      <hr {...decorativeProps} ref={ref as ForwardedRef<HTMLHRElement>} />
    ) : (
      <div {...decorativeProps} ref={ref as ForwardedRef<HTMLDivElement>} />
    );
  }

  return (
    <AriaSeparator
      {...props}
      className={dividerClassName}
      orientation={orientation}
      ref={ref}
      slot={slot}
    />
  );
});
