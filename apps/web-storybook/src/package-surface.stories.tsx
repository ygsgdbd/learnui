import * as LearnUI from "@learnui/web";
import type { Meta, StoryObj } from "@storybook/react-vite";

function PackageSurfaceSmoke() {
  return (
    <main
      data-learnui-export-count={Object.keys(LearnUI).length}
      style={{
        background: "var(--learnui-color-canvas)",
        border: "1px solid var(--learnui-color-border)",
        borderRadius: "var(--learnui-radius-surface)",
        boxShadow: "var(--learnui-shadow-surface)",
        color: "var(--learnui-color-foreground)",
        fontFamily: "var(--learnui-font-sans)",
        maxWidth: 420,
        padding: 24
      }}
    >
      <p
        style={{
          color: "var(--learnui-color-muted)",
          margin: 0
        }}
      >
        @learnui/web package surface
      </p>
    </main>
  );
}

const meta = {
  title: "Package/Surface",
  component: PackageSurfaceSmoke
} satisfies Meta<typeof PackageSurfaceSmoke>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Smoke: Story = {};
