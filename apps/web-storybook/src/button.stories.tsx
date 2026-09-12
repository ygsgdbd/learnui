import { useEffect, useRef, useState } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "@learnui/web";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, spyOn, userEvent, waitFor, within } from "storybook/test";

function ButtonActions() {
  const [count, setCount] = useState(0);
  const [pending, setPending] = useState(false);
  return <div style={{ display: "flex", gap: 16 }}>
    <Button onPress={() => { setCount(count + 1); setPending(true); }} isPending={pending}>Save lesson</Button>
    <Button onPress={() => setPending(false)}>Finish saving</Button>
    <Button isDisabled onPress={() => setCount(count + 1)}>Unavailable</Button>
    <output aria-label="Save count">{count}</output>
  </div>;
}
const meta = {
  title: "Components/Button",
  component: ButtonActions,
  decorators: [(Story) => <div style={{ background: "var(--learnui-color-canvas)", color: "var(--learnui-color-foreground)", padding: 24 }}><Story /></div>]
} satisfies Meta<typeof ButtonActions>;
export default meta;
type Story = StoryObj<typeof meta>;
export const PendingAndDisabled: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const save = canvas.getByRole("button", { name: "Save lesson" });
    await userEvent.click(save);
    await expect(save).toHaveFocus();
    await waitFor(() => expect(save).toHaveAttribute("aria-busy", "true"));
    await expect(save).not.toBeDisabled();
    await expect(canvas.queryByRole("progressbar")).toBeNull();
    await userEvent.click(save);
    await userEvent.keyboard("{Enter} ");
    await userEvent.click(canvas.getByRole("button", { name: "Unavailable" }));
    await expect(canvas.getByLabelText("Save count")).toHaveTextContent("1");
    await userEvent.click(canvas.getByRole("button", { name: "Finish saving" }));
    await userEvent.click(save);
    await expect(canvas.getByLabelText("Save count")).toHaveTextContent("2");
    await userEvent.click(canvas.getByRole("button", { name: "Finish saving" }));
    // Let React Aria finish its transient announcement while the named owner is mounted.
    await waitFor(() => expect(within(document.body).queryAllByRole("img", { name: "Save lesson" })).toHaveLength(0), { timeout: 8000 });
  }
};

export const PressFeedback: Story = {
  render: () => <Button>Press feedback</Button>,
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Press feedback" });
    await userEvent.pointer({ keys: "[MouseLeft>]", target: button });
    await expect(button).toHaveAttribute("data-pressed");
    await new Promise((resolve) => setTimeout(resolve, 180));
    const style = getComputedStyle(button);
    await expect(style.opacity).toBe("0.88");
    await expect(style.transform).toBe(matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "none" : "matrix(0.98, 0, 0, 0.98, 0, 0)");
    await userEvent.pointer({ keys: "[/MouseLeft]", target: button });
    await userEvent.keyboard("[Space>]");
    await expect(button).toHaveAttribute("data-pressed");
    await expect(getComputedStyle(button).transform).toBe("none");
    await userEvent.keyboard("[/Space]");
  }
};

const variants: ButtonVariant[] = ["primary", "secondary", "outline", "ghost", "destructive"];
const sizes: ButtonSize[] = ["sm", "md", "lg"];
function ButtonAxes() {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => { ref.current?.setAttribute("data-ref-forwarded", "true"); }, []);
  return <div style={{ display: "grid", gap: 24 }}>
    <style>{`.storybook-button-override { background: rgb(128, 0, 128); border-radius: 20px; }`}</style>
    <section style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      {variants.map(variant => <Button key={variant} variant={variant}>{variant}</Button>)}
    </section>
    <section style={{ display: "flex", alignItems: "center", gap: 16 }}>
      {sizes.map(size => <Button key={size} size={size}>{size}</Button>)}
    </section>
    <div><Button className="storybook-button-override" ref={ref}>Consumer override</Button></div>
    <div><Button aria-label="Add lesson"><span aria-hidden="true">+</span></Button></div>
    <div><Button isPending>Saving lesson</Button> <Button isDisabled>Disabled lesson</Button></div>
  </div>;
}
export const AxesAndConsumerOverride: Story = {
  render: () => <ButtonAxes />,
  globals: { theme: "light" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const variant of variants) {
      const button = canvas.getByRole("button", { name: variant });
      await expect(button.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
      await expect(button.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
    }
    for (const size of sizes) {
      await expect(canvas.getByRole("button", { name: size }).getBoundingClientRect().height)
        .toBeGreaterThanOrEqual(size === "lg" ? 52 : 44);
    }
    const override = canvas.getByRole("button", { name: "Consumer override" });
    await expect(override).toHaveAttribute("data-ref-forwarded", "true");
    await expect(override.className.endsWith("storybook-button-override")).toBe(true);
    await expect(getComputedStyle(override).backgroundColor).toBe("rgb(128, 0, 128)");
    await expect(getComputedStyle(override).borderRadius).toBe("20px");
    await expect(canvas.getByRole("button", { name: "Add lesson" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Saving lesson" })).toHaveAttribute("aria-busy", "true");
    await expect(canvas.queryByRole("progressbar")).toBeNull();
  }
};
export const DarkTheme: Story = {
  render: () => <ButtonAxes />,
  globals: { theme: "dark" }
};
export const SystemTheme: Story = {
  render: () => <ButtonAxes />,
  globals: { theme: "system" }
};
function ButtonForm() {
  const [count, setCount] = useState(0);
  const [submitted, setSubmitted] = useState("");
  const [pending, setPending] = useState(false);
  return <form onReset={() => setPending(false)} onSubmit={(event) => {
    event.preventDefault();
    setSubmitted(String(new FormData(event.currentTarget, (event.nativeEvent as SubmitEvent).submitter).get("intent")));
    setPending(true);
  }} style={{ display: "flex", gap: 16 }}>
    <input aria-label="Lesson title" name="title" required />
    <Button onPress={() => setCount(value => value + 1)}>Count press</Button>
    <Button type="submit" name="intent" value="save" isPending={pending}>Submit lesson</Button>
    <Button type="reset">Reset lesson</Button>
    <output aria-label="Press count">{count}</output>
    <output aria-label="Submitted intent">{submitted || "none"}</output>
  </form>;
}
export const KeyboardFormAndRapidPress: Story = {
  render: () => <ButtonForm />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const count = canvas.getByRole("button", { name: "Count press" });
    const input = canvas.getByRole("textbox", { name: "Lesson title" });
    input.focus();
    await userEvent.tab();
    await expect(count).toHaveFocus();
    await expect(count).toHaveAttribute("data-focus-visible");
    await userEvent.keyboard("{Enter} ");
    await waitFor(() => expect(canvas.getByLabelText("Press count")).toHaveTextContent("2"));
    await expect(canvas.getByLabelText("Submitted intent")).toHaveTextContent("none");
    for (let index = 0; index < 20; index++) await userEvent.click(count);
    await waitFor(() => expect(canvas.getByLabelText("Press count")).toHaveTextContent("22"));
    const submit = canvas.getByRole("button", { name: "Submit lesson" });
    await userEvent.click(submit);
    await expect(input).toBeInvalid();
    await expect(canvas.getByLabelText("Submitted intent")).toHaveTextContent("none");
    await userEvent.type(input, "Accessible actions");
    await userEvent.click(submit);
    await waitFor(() => expect(canvas.getByLabelText("Submitted intent")).toHaveTextContent("save"));
    await expect(submit).toHaveFocus();
    await expect(submit).toHaveAttribute("aria-busy", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Reset lesson" }));
    await expect(input).toHaveValue("");
    await waitFor(() => expect(within(document.body).queryAllByRole("img", { name: "Submit lesson" })).toHaveLength(0), { timeout: 8000 });
  }
};

function ButtonNaming() {
  const [label, setLabel] = useState("Named action");
  return <div style={{ display: "flex", gap: 16 }}>
    <Button>{label}</Button>
    <Button onPress={() => setLabel(" ")}>Invalidate action name</Button>
    <Button onPress={() => setLabel("Named action")}>Restore action name</Button>
    <span id="icon-action-label">Add bookmark</span>
    <Button aria-labelledby="icon-action-label" isPending><span aria-hidden="true">+</span></Button>
  </div>;
}
export const AccessibleNamesAndDeveloperFeedback: Story = {
  render: () => <ButtonNaming />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const warning = spyOn(console, "warn").mockImplementation(() => {});
    try {
      await userEvent.click(canvas.getByRole("button", { name: "Invalidate action name" }));
      await waitFor(() => expect(warning).toHaveBeenCalledWith(
        "LearnUI Button: icon-only or non-text content requires a non-empty aria-label or aria-labelledby."
      ));
      await userEvent.click(canvas.getByRole("button", { name: "Restore action name" }));
      await expect(canvas.getByRole("button", { name: "Named action" })).toBeVisible();
      await expect(canvas.getByRole("button", { name: "Add bookmark" })).toHaveAttribute("aria-busy", "true");
      await expect(canvas.queryByRole("progressbar")).toBeNull();
    } finally {
      warning.mockRestore();
    }
  }
};
