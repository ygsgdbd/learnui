import { useEffect, useRef } from "react";

import {
  Spinner,
  type SpinnerColor,
  type SpinnerSize
} from "@learnui/web";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

function SpinnerSemantics() {
  const spinnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    spinnerRef.current?.setAttribute("data-ref-forwarded", "true");
  }, []);

  return (
    <div style={{ display: "flex", gap: 24 }}>
      <Spinner label="Loading lessons" ref={spinnerRef} />
      <button aria-busy="true" type="button">
        Saving
        <Spinner data-testid="decorative-spinner" isDecorative />
      </button>
    </div>
  );
}

const colors: SpinnerColor[] = [
  "neutral",
  "accent",
  "success",
  "warning",
  "destructive"
];
const sizes: SpinnerSize[] = ["sm", "md", "lg"];

function SpinnerAxes() {
  return (
    <div
      style={{
        color: "var(--learnui-color-foreground)",
        display: "grid",
        fontFamily: "var(--learnui-font-sans)",
        gap: 24
      }}
    >
      <style>{`
        .storybook-spinner-override {
          color: rgb(128, 0, 128);
          height: 32px;
          width: 32px;
        }
      `}</style>

      <section style={{ display: "flex", gap: 16 }}>
        {colors.map((color) => (
          <Spinner color={color} key={color} label={`${color} spinner`} />
        ))}
      </section>

      <section style={{ alignItems: "center", display: "flex", gap: 16 }}>
        {sizes.map((size) => (
          <Spinner key={size} label={`${size} spinner`} size={size} />
        ))}
      </section>

      <Spinner
        className="storybook-spinner-override"
        label="Consumer override"
        size="sm"
      />
    </div>
  );
}

const meta = {
  title: "Components/Spinner",
  component: SpinnerSemantics,
  parameters: {
    layout: "padded"
  }
} satisfies Meta<typeof SpinnerSemantics>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SemanticsAndRef: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const standalone = canvas.getByRole("progressbar", { name: "Loading lessons" });
    const decorative = canvas.getByTestId("decorative-spinner");

    await expect(standalone).toHaveAttribute("data-ref-forwarded", "true");
    await expect(standalone).not.toHaveAttribute("aria-valuenow");
    await expect(standalone.querySelector("[aria-hidden='true']")).not.toBeNull();
    await expect(decorative).toHaveAttribute("aria-hidden", "true");
    await expect(canvas.getAllByRole("progressbar")).toHaveLength(1);
  }
};

export const AxesAndConsumerOverride: Story = {
  globals: { theme: "light" },
  render: () => <SpinnerAxes />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const expectedColors: Record<SpinnerColor, string> = {
      neutral: "rgb(110, 110, 115)",
      accent: "rgb(0, 113, 227)",
      success: "rgb(36, 138, 61)",
      warning: "rgb(169, 101, 0)",
      destructive: "rgb(215, 0, 21)"
    };
    const expectedSizes: Record<SpinnerSize, string> = {
      sm: "16px",
      md: "20px",
      lg: "24px"
    };

    for (const color of colors) {
      await expect(getComputedStyle(canvas.getByRole("progressbar", {
        name: `${color} spinner`
      })).color).toBe(expectedColors[color]);
    }

    for (const size of sizes) {
      const spinnerStyle = getComputedStyle(canvas.getByRole("progressbar", {
        name: `${size} spinner`
      }));
      await expect(spinnerStyle.width).toBe(expectedSizes[size]);
      await expect(spinnerStyle.height).toBe(expectedSizes[size]);
    }

    const override = canvas.getByRole("progressbar", { name: "Consumer override" });
    await expect(override.className.endsWith("storybook-spinner-override")).toBe(true);
    await expect(getComputedStyle(override).width).toBe("32px");
    await expect(getComputedStyle(override).color).toBe("rgb(128, 0, 128)");
  }
};

export const LightTheme: Story = {
  globals: { theme: "light" },
  render: () => <Spinner color="accent" label="Light theme spinner" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(getComputedStyle(canvas.getByRole("progressbar", {
      name: "Light theme spinner"
    })).color).toBe("rgb(0, 113, 227)");
  }
};

export const DarkTheme: Story = {
  globals: { theme: "dark" },
  render: () => <Spinner color="accent" label="Dark theme spinner" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(getComputedStyle(canvas.getByRole("progressbar", {
      name: "Dark theme spinner"
    })).color).toBe("rgb(10, 132, 255)");
  }
};

export const MotionPreferences: Story = {
  render: () => <Spinner label="Motion spinner" />,
  play: async ({ canvasElement }) => {
    const indicator = within(canvasElement)
      .getByRole("progressbar", { name: "Motion spinner" })
      .querySelector<HTMLElement>(".learnui-spinner__indicator");

    await expect(indicator).not.toBeNull();
    const indicatorStyle = getComputedStyle(indicator!);

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      await expect(indicatorStyle.animationName).toBe("none");
      await expect(indicatorStyle.opacity).toBe("0.72");
    } else {
      await expect(indicatorStyle.animationName).toBe("learnui-spinner-rotate");
      await expect(indicatorStyle.animationIterationCount).toBe("infinite");
    }
  }
};
