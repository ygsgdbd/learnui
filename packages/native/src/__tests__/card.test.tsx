import { createRef } from "react";
import { AccessibilityInfo, Text, View } from "react-native";
import { act, render } from "@testing-library/react-native";
import { Card } from "@learnui/native";

test("Card composes six public parts without grouping or adding a control", async () => {
  const ref = createRef<View>();
  const screen = await render(
    <Card.Root ref={ref} testID="card">
      <Card.Header><Card.Title>Account</Card.Title><Card.Description>Personal details</Card.Description></Card.Header>
      <Card.Body><Text>Balance</Text></Card.Body>
      <Card.Footer><Text>Updated today</Text></Card.Footer>
    </Card.Root>
  );
  expect(ref.current).not.toBeNull();
  expect(screen.getByText("Account")).toBeTruthy();
  expect(screen.getByTestId("card").props.accessible).toBe(false);
  expect(screen.queryByRole("button")).toBeNull();
  expect(Object.keys(Card)).toEqual(["Root", "Header", "Title", "Description", "Body", "Footer"]);
});

test.each(["Root", "Header", "Title", "Description", "Body", "Footer"] as const)(
  "%s forwards its host ref, className and style", async part => {
    const Part = Card[part];
    const ref = createRef<any>();
    const style = { opacity: 0.5 };
    const screen = await render(<Part ref={ref} testID="part" className="gap-8 text-2xl" style={style}>{part === "Title" || part === "Description" ? "Text" : <Text>Content</Text>}</Part>);
    const host = screen.getByTestId("part");
    expect(ref.current).not.toBeNull();
    expect(host.props.style).toBe(style);
    expect(host.props.className).toContain("gap-8");
    expect(host.props.className).not.toMatch(/\bgap-[134]\b/);
    if (part === "Title" || part === "Description") {
      expect(host.props.className).toContain("text-2xl");
      expect(host.props.className).toContain("font-[family-name:var(--learnui-font-sans)]");
      expect(host.props.className).not.toMatch(/\btext-(xl|sm)\b/);
      expect(host.props.numberOfLines).toBeUndefined();
      expect(host.props.allowFontScaling).not.toBe(false);
    }
  }
);

test.each(["surface", "elevated", "outline"] as const)("%s remains a passive content container", async variant => {
  const screen = await render(<Card.Root variant={variant} testID="card"><Text>Content</Text></Card.Root>);
  const host = screen.getByTestId("card");
  expect(host.props.onPress).toBeUndefined();
  expect(host.props.accessibilityState).toBeUndefined();
  expect(host.props.accessibilityRole).toBeUndefined();
  expect(host.props.className).toContain("border-[--learnui-color-border]");
});

test("surface follows live reduced transparency and keeps consumer classes last", async () => {
  let onChange: (enabled: boolean) => void = () => {};
  const remove = jest.fn();
  const query = jest.spyOn(AccessibilityInfo, "isReduceTransparencyEnabled").mockResolvedValue(false);
  const subscribe = jest.spyOn(AccessibilityInfo, "addEventListener").mockImplementation((_event, listener) => {
    onChange = listener as (enabled: boolean) => void;
    return { remove };
  });
  const screen = await render(<Card.Root testID="card" />);
  expect(screen.getByTestId("card").props.className).toContain("bg-[--learnui-color-surface]");
  await act(() => onChange(true));
  expect(screen.getByTestId("card").props.className).toContain("bg-[--learnui-color-elevated]");
  expect(screen.getByTestId("card").props.className).not.toContain("bg-[--learnui-color-surface]");
  await screen.rerender(<Card.Root testID="card" className="bg-[--learnui-color-accent]" />);
  expect(screen.getByTestId("card").props.className).toContain("bg-[--learnui-color-accent]");
  expect(screen.getByTestId("card").props.className).not.toContain("bg-[--learnui-color-elevated]");
  await screen.unmount();
  expect(remove).toHaveBeenCalled();
  query.mockRestore();
  subscribe.mockRestore();
});
