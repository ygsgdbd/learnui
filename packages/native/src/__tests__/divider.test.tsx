import { createRef } from "react";
import { StyleSheet, View } from "react-native";
import { render } from "@testing-library/react-native";

import { Divider, type DividerProps } from "@learnui/native";

describe("Divider", () => {
  test("is decorative and hidden from accessibility by default", async () => {
    const conflictingAlias = { "aria-hidden": false } as unknown as DividerProps;
    const screen = await render(<Divider {...conflictingAlias} />);
    const root = screen.root;

    expect(root).not.toBeNull();
    expect(screen.queryByRole("separator")).toBeNull();
    expect(root?.props.accessible).toBe(false);
    expect(root?.props.accessibilityElementsHidden).toBe(true);
    expect(root?.props.importantForAccessibility).toBe("no-hide-descendants");
  });

  test("opts into native separator semantics", async () => {
    const conflictingAlias = { "aria-hidden": true } as unknown as DividerProps;
    const screen = await render(<Divider {...conflictingAlias} isDecorative={false} />);
    const root = screen.getByRole("separator");

    expect(root.props.accessibilityElementsHidden).toBe(false);
  });

  test("forwards the root ref and merges consumer presentation last", async () => {
    const ref = createRef<React.ElementRef<typeof View>>();
    const consumerStyle = { borderTopWidth: 4, opacity: 0.6 } as const;
    const screen = await render(
      <Divider
        className="self-end border-[--learnui-color-accent]"
        isDecorative={false}
        ref={ref}
        style={consumerStyle}
      />
    );
    const root = screen.getByRole("separator");

    expect(ref.current).not.toBeNull();
    expect(root.props.className).toContain("self-end");
    expect(root.props.className).toContain("border-[--learnui-color-accent]");
    expect(root.props.className).not.toContain("self-stretch");
    expect(root.props.className).not.toContain("border-[--learnui-color-border]");
    expect(root.props.style).toEqual([
      { borderTopWidth: StyleSheet.hairlineWidth },
      consumerStyle
    ]);
  });

  test.each([
    ["horizontal", "hairline", { borderTopWidth: StyleSheet.hairlineWidth }],
    ["horizontal", "regular", { borderTopWidth: 1 }],
    ["vertical", "hairline", { borderLeftWidth: StyleSheet.hairlineWidth }],
    ["vertical", "regular", { borderLeftWidth: 1 }]
  ] as const)("maps %s %s to host styling", async (orientation, weight, expectedStyle) => {
    const screen = await render(
      <Divider isDecorative={false} orientation={orientation} weight={weight} />
    );
    const root = screen.getByRole("separator");

    expect(root.props.style).toEqual(expectedStyle);
  });
});
