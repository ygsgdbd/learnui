import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn, tv } from "./internal/styles";

export type CardVariant = "surface" | "elevated" | "outline";
export interface CardRootProps extends ComponentPropsWithoutRef<"div"> { variant?: CardVariant }
export type CardViewProps = ComponentPropsWithoutRef<"div">;
export type CardTitleProps = ComponentPropsWithoutRef<"h3">;
export type CardDescriptionProps = ComponentPropsWithoutRef<"p">;
const root = tv({
  base: "learnui-card",
  variants: { variant: {
    surface: "learnui-card--surface",
    elevated: "learnui-card--elevated",
    outline: "learnui-card--outline"
  } },
  defaultVariants: { variant: "surface" }
});
const Root = forwardRef<HTMLDivElement, CardRootProps>(function CardRoot({ className, variant, ...props }, ref) {
  return <div {...props} ref={ref} className={root({ variant, class: className })} />;
});
const Header = forwardRef<HTMLDivElement, CardViewProps>(function CardHeader({ className, ...props }, ref) {
  return <div {...props} ref={ref} className={cn("learnui-card__header", className)} />;
});
const Title = forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle({ className, ...props }, ref) {
  return <h3 {...props} ref={ref} className={cn("learnui-card__title", className)} />;
});
const Description = forwardRef<HTMLParagraphElement, CardDescriptionProps>(function CardDescription({ className, ...props }, ref) {
  return <p {...props} ref={ref} className={cn("learnui-card__description", className)} />;
});
const Body = forwardRef<HTMLDivElement, CardViewProps>(function CardBody({ className, ...props }, ref) {
  return <div {...props} ref={ref} className={cn("learnui-card__body", className)} />;
});
const Footer = forwardRef<HTMLDivElement, CardViewProps>(function CardFooter({ className, ...props }, ref) {
  return <div {...props} ref={ref} className={cn("learnui-card__footer", className)} />;
});
export const Card = { Root, Header, Title, Description, Body, Footer };
