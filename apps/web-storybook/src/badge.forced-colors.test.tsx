import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { Badge, type BadgeColor, type BadgeVariant } from "@learnui/web";
import "@learnui/web/styles";

const colors: BadgeColor[] = ["neutral", "accent", "success", "warning", "destructive"];
const variants: BadgeVariant[] = ["solid", "soft", "outline"];

test("forced colors preserves readable status text and visible boundaries across Badge axes", () => {
  expect(matchMedia("(forced-colors: active)").matches).toBe(true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    flushSync(() => {
      root.render(<>{variants.flatMap((variant) => colors.map((color) => (
        <Badge key={`${variant}-${color}`} variant={variant} color={color}>
          {`${variant} ${color} status`}
        </Badge>
      )))}</>);
    });
    const badges = host.querySelectorAll("span");
    expect(badges.length).toBe(15);
    for (const badge of badges) {
      const style = getComputedStyle(badge);
      expect(badge.textContent).toContain("status");
      expect(style.color).not.toBe(style.backgroundColor);
      expect(style.borderTopColor).toBe(style.color);
      expect(parseFloat(style.borderTopWidth)).toBeGreaterThan(0);
      expect(badge.tabIndex).toBe(-1);
    }
  } finally {
    flushSync(() => root.unmount());
    host.remove();
  }
});
