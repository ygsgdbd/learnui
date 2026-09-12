import { Card } from "@learnui/web";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

function CardContract() {
  return <div style={{ maxWidth: 520, display: "grid", gap: 24 }}>
    {(["surface", "elevated", "outline"] as const).map(variant =>
      <Card.Root key={variant} variant={variant} data-variant={variant}>
        <Card.Header><Card.Title>{variant} account</Card.Title><Card.Description>Personal details</Card.Description></Card.Header>
        <Card.Body><p>Balance available</p></Card.Body>
        <Card.Footer><a href="#details">View {variant} details</a></Card.Footer>
      </Card.Root>
    )}
  </div>;
}
const meta = { title: "Components/Card", component: CardContract } satisfies Meta<typeof CardContract>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Composition: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("heading")).toHaveLength(3);
    await expect(canvas.queryByRole("button")).toBeNull();
    for (const root of canvasElement.querySelectorAll("[data-variant]")) {
      await expect(root).not.toHaveAttribute("role");
      await expect(root).not.toHaveAttribute("tabindex");
    }
  }
};

function RefsAndReflow() {
  const forwarded = (node: HTMLElement | null) => { node?.setAttribute("data-ref-forwarded", "true"); };
  return <div style={{ width: 280 }}>
    <Card.Root ref={forwarded} className="card-override">
      <Card.Header ref={forwarded} className="header-override">
        <Card.Title ref={forwarded} className="title-override">Long account title wraps naturally</Card.Title>
        <Card.Description ref={forwarded} className="description-override">Details remain readable at larger text sizes.</Card.Description>
      </Card.Header>
      <Card.Body ref={forwarded} className="body-override"><p>{"Long content flows naturally. ".repeat(20)}</p></Card.Body>
      <Card.Footer ref={forwarded} className="footer-override"><a href="#end">Continue</a></Card.Footer>
    </Card.Root>
    <Card.Root>Children only</Card.Root>
    <Card.Root><Card.Body>Body only</Card.Body></Card.Root>
  </div>;
}
export const ConsumerOverrideAndLongContent: Story = {
  render: () => <RefsAndReflow />,
  play: async ({ canvasElement }) => {
    const parts = canvasElement.querySelectorAll<HTMLElement>("[data-ref-forwarded]");
    await expect(parts).toHaveLength(6);
    for (const part of parts) {
      await expect(part.className).toMatch(/-override$/);
      await expect(part.scrollWidth).toBeLessThanOrEqual(part.clientWidth);
    }
    await expect(getComputedStyle(parts[0]!).padding).toBe("28px");
    await expect(within(canvasElement).getByText("Body only")).toBeVisible();
  }
};

export const Light: Story = { ...Composition, globals: { theme: "light" } };
export const Dark: Story = { ...Composition, globals: { theme: "dark" } };
