import { forwardRef, useEffect, type ReactNode } from "react";
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps
} from "react-aria-components";

import { tv } from "./internal/styles";
import { Spinner } from "./spinner";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps
  extends Omit<AriaButtonProps, "children" | "className" | "render" | "aria-busy"> {
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export type ButtonProps = ButtonBaseProps & (
  | { children: string | number }
  | { children?: ReactNode; "aria-label": string }
  | { children?: ReactNode; "aria-labelledby": string }
);

const button = tv({
  base: "learnui-button",
  variants: {
    variant: {
      primary: "learnui-button--primary",
      secondary: "learnui-button--secondary",
      outline: "learnui-button--outline",
      ghost: "learnui-button--ghost",
      destructive: "learnui-button--destructive"
    },
    size: {
      sm: "learnui-button--sm",
      md: "learnui-button--md",
      lg: "learnui-button--lg"
    }
  },
  defaultVariants: { variant: "primary", size: "md" }
});

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, className, isPending = false, variant = "primary", size = "md", ...props },
  ref
) {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" &&
      !((typeof children === "string" && children.trim()) || typeof children === "number") &&
      !props["aria-label"]?.trim() &&
      !props["aria-labelledby"]?.trim()
    ) {
      console.warn("LearnUI Button: icon-only or non-text content requires a non-empty aria-label or aria-labelledby.");
    }
  }, [children, props["aria-label"], props["aria-labelledby"]]);

  return (
    <AriaButton
      {...props}
      className={button({ class: className, size, variant })}
      isPending={isPending}
      ref={ref}
      // React Aria filters aria-busy from its root props; keep it on the same DOM owner.
      render={(domProps) => <button {...domProps} aria-busy={isPending || undefined} />}
    >
      {isPending && <Spinner className="learnui-button__spinner" isDecorative size={size} />}
      <span className="learnui-button__content">{children}</span>
    </AriaButton>
  );
});
