import { useEffect, useRef } from "react";

import { Divider } from "@learnui/web";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

function DividerContract() {
  const decorativeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    decorativeRef.current?.setAttribute("data-ref-forwarded", "true");
  }, []);

  return (
    <div
      style={{
        color: "var(--learnui-color-foreground)",
        display: "grid",
        fontFamily: "var(--learnui-font-sans)",
        gap: 24,
        maxWidth: 520
      }}
    >
      <section>
        <p>Decorative horizontal hairline</p>
        <Divider ref={decorativeRef} />
      </section>

      <section>
        <p>Semantic horizontal regular</p>
        <Divider
          aria-label="Horizontal sections"
          isDecorative={false}
          weight="regular"
        />
      </section>

      <section style={{ display: "flex", gap: 16, height: 80 }}>
        <span>Left</span>
        <Divider
          aria-label="Vertical sections"
          className="storybook-divider-override"
          isDecorative={false}
          orientation="vertical"
        />
        <span>Right</span>
      </section>
    </div>
  );
}

const meta = {
  title: "Components/Divider",
  component: DividerContract,
  parameters: {
    layout: "padded"
  }
} satisfies Meta<typeof DividerContract>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AxesAndConsumerOverride: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const decorative = canvasElement.querySelector<HTMLElement>("[data-ref-forwarded='true']");
    const horizontal = canvas.getByRole("separator", { name: "Horizontal sections" });
    const vertical = canvas.getByRole("separator", { name: "Vertical sections" });
    const horizontalStyle = getComputedStyle(horizontal);

    await expect(decorative).not.toBeNull();
    await expect(decorative).toHaveAttribute("aria-hidden", "true");
    const decorativeStyle = getComputedStyle(decorative!);
    await expect(Number.parseFloat(decorativeStyle.borderBlockStartWidth)).toBeGreaterThan(0);
    await expect(horizontal).not.toHaveAttribute("aria-orientation");
    await expect(horizontalStyle.borderBlockStartWidth).toBe("1px");
    await expect(vertical).toHaveAttribute("aria-orientation", "vertical");
    await expect(vertical).toHaveClass("storybook-divider-override");
    await expect(vertical.className.endsWith("storybook-divider-override")).toBe(true);
    await expect(getComputedStyle(vertical).borderInlineStartWidth).toBe("4px");
    await expect(getComputedStyle(vertical).borderInlineStartColor).toBe("rgb(255, 0, 0)");
  }
};
