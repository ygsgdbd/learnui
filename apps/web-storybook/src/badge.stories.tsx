import { useEffect, useRef } from "react";
import { Badge, type BadgeColor, type BadgeVariant, type BadgeSize } from "@learnui/web";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

function BadgeSemantics() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => { ref.current?.setAttribute("data-ref-forwarded", "true"); }, []);
  return (
    <div>
      <button type="button">Before status</button>
      <Badge ref={ref}>Published</Badge>
      <button aria-label="Inbox, 3 unread messages" type="button">
        Inbox <Badge isDecorative>3 unread</Badge>
      </button>
    </div>
  );
}

const meta = {
  title: "Components/Badge",
  component: BadgeSemantics,
  parameters: { layout: "padded" }
} satisfies Meta<typeof BadgeSemantics>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SemanticsAndRef: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText("Published");
    await expect(badge.tagName).toBe("SPAN");
    await expect(badge).toHaveAttribute("data-ref-forwarded", "true");
    await expect(badge).not.toHaveAttribute("role");
    await expect(badge.tabIndex).toBe(-1);
    await expect(canvas.getByText("3 unread")).toHaveAttribute("aria-hidden", "true");
    const before = canvas.getByRole("button", { name: "Before status" });
    before.focus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Inbox, 3 unread messages" })).toHaveFocus();
  }
};

const colors: BadgeColor[] = ["neutral", "accent", "success", "warning", "destructive"];
const variants: BadgeVariant[] = ["solid", "soft", "outline"];
const sizes: BadgeSize[] = ["sm", "md"];

function BadgeAxes() {
  return (
    <div style={{ background: "var(--learnui-color-canvas)", color: "var(--learnui-color-foreground)", display: "grid", gap: 16, justifyItems: "start", padding: 16 }}>
      <style>{`.storybook-badge-override { border-radius: 0; font-size: 18px; }`}</style>
      {variants.map((variant) => (
        <div key={variant} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {colors.map((color) => <Badge color={color} key={color} variant={variant}>{`${variant} ${color} status`}</Badge>)}
        </div>
      ))}
      {sizes.map((size) => <Badge key={size} size={size}>{`${size} status`}</Badge>)}
      <Badge className="storybook-badge-override" size="sm">Consumer override</Badge>
    </div>
  );
}

export const AxesAndConsumerOverride: Story = {
  globals: { theme: "light" },
  render: () => <BadgeAxes />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(getComputedStyle(canvas.getByText("solid accent status")).backgroundColor).toBe("rgb(0, 113, 227)");
    await expect(getComputedStyle(canvas.getByText("outline warning status")).borderTopColor).toBe("rgb(169, 101, 0)");
    await expect(getComputedStyle(canvas.getByText("sm status")).fontSize).toBe("12px");
    await expect(getComputedStyle(canvas.getByText("md status")).fontSize).toBe("14px");
    const override = canvas.getByText("Consumer override");
    await expect(override.className.endsWith("storybook-badge-override")).toBe(true);
    await expect(getComputedStyle(override).fontSize).toBe("18px");
    await expect(getComputedStyle(override).borderRadius).toBe("0px");
  }
};

export const LightTheme: Story = { ...AxesAndConsumerOverride };
export const DarkTheme: Story = {
  globals: { theme: "dark" },
  render: () => <BadgeAxes />,
  play: async ({ canvasElement }) => {
    const style = getComputedStyle(within(canvasElement).getByText("solid accent status"));
    await expect(style.backgroundColor).toBe("rgb(10, 132, 255)");
    await expect(style.color).toBe("rgb(0, 0, 0)");
  }
};
export const SystemTheme: Story = {
  globals: { theme: "system" },
  render: () => <BadgeAxes />,
  play: async ({ canvasElement }) => {
    const style = getComputedStyle(within(canvasElement).getByText("solid accent status"));
    const dark = matchMedia("(prefers-color-scheme: dark)").matches;
    await expect(style.backgroundColor).toBe(dark ? "rgb(10, 132, 255)" : "rgb(0, 113, 227)");
    await expect(style.color).toBe(dark ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)");
  }
};
