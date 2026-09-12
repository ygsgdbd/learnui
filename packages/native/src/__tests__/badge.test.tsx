import { createRef } from "react";
import { Pressable, Text } from "react-native";
import { render } from "@testing-library/react-native";

import { Badge, type BadgeProps } from "@learnui/native";

describe("Badge", () => {
  test("exposes status as text without an actionable role or keyboard focus", async () => {
    const screen = await render(<Badge color="success">Approved</Badge>);
    const badge = screen.getByText("Approved");

    expect(screen.queryByRole("button")).toBeNull();
    expect(badge.props.onPress).toBeUndefined();
    expect(badge.props.focusable).not.toBe(true);
    expect(badge.props.accessible).toBe(true);
    expect(badge.props.numberOfLines).toBeUndefined();
  });
  test("decorative embedding leaves meaning on its accessible owner", async () => {
    const conflicting = { "aria-hidden": false, accessible: true } as unknown as BadgeProps;
    const screen = await render(
      <Pressable accessibilityRole="button" accessibilityLabel="Inbox, 3 unread messages">
        <Badge {...conflicting} isDecorative>3 unread</Badge>
      </Pressable>
    );
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Inbox, 3 unread messages" })).toBeTruthy();
    expect(screen.queryByText("3 unread")).toBeNull();
    const badge = screen.getByText("3 unread", { includeHiddenElements: true });
    expect(badge.props.accessibilityElementsHidden).toBe(true);
    expect(badge.props.importantForAccessibility).toBe("no-hide-descendants");
    expect(badge.props.accessible).toBe(false);
  });
  test("forwards its Text ref and lets consumer classes and styles override presentation", async () => {
    const ref = createRef<Text>();
    const style = { backgroundColor: "#123456", paddingVertical: 12 };
    const screen = await render(
      <Badge ref={ref} className="px-6 rounded-none" style={style}>Custom status</Badge>
    );
    const badge = screen.getByText("Custom status");
    expect(ref.current).not.toBeNull();
    expect(badge.props.className).toContain("px-6");
    expect(badge.props.className).toContain("text-sm");
    expect(badge.props.className).not.toContain("px-2.5");
    expect(badge.props.className).not.toContain("rounded-[--learnui-radius-control]");
    expect(badge.props.style).toBe(style);
  });

  test.each([
    ["solid", "accent", "sm", "bg-[--learnui-color-accent]", "text-xs"],
    ["soft", "success", "md", "bg-[--learnui-color-success]/10", "text-sm"],
    ["outline", "warning", "sm", "border-[--learnui-color-warning]", "text-xs"],
    ["solid", "destructive", "md", "bg-[--learnui-color-destructive]", "text-sm"],
    ["solid", "neutral", "md", "bg-[--learnui-color-foreground]", "text-sm"]
  ] as const)("renders %s %s %s with readable text", async (variant, color, size, colorClass, sizeClass) => {
    const screen = await render(<Badge variant={variant} color={color} size={size}>Status</Badge>);
    const badge = screen.getByText("Status");
    expect(badge.props.className).toContain(colorClass);
    expect(badge.props.className).toContain(sizeClass);
    expect(badge.props.className).not.toMatch(/(?:^| )h-/);
    expect(badge.props.allowFontScaling).not.toBe(false);
  });

  test("uses a contrast-safe foreground for the light success solid status", async () => {
    const screen = await render(<Badge color="success" variant="solid">Approved</Badge>);
    expect(screen.getByText("Approved").props.className).toContain("text-[--lui-badge-success-solid-foreground]");
  });

});
