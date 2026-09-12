import { createRef } from "react";
import { AccessibilityInfo, Animated, StyleSheet, View } from "react-native";
import { act, fireEvent, render } from "@testing-library/react-native";

import { Button } from "@learnui/native";

describe("Button", () => {
  afterEach(() => jest.restoreAllMocks());

  test("guards platform accessibility activation callbacks while pending and resumes them when ready", async () => {
    const onAccessibilityTap = jest.fn();
    const onMagicTap = jest.fn();
    const onAccessibilityAction = jest.fn();
    const callbacks = { onAccessibilityTap, onMagicTap, onAccessibilityAction };
    const screen = await render(<Button {...callbacks}>Save</Button>);
    const activate = async () => {
      const root = screen.getByRole("button", { name: "Save" });
      await fireEvent(root, "accessibilityTap", {});
      await fireEvent(root, "magicTap", {});
      await fireEvent(root, "accessibilityAction", { nativeEvent: { actionName: "activate" } });
    };
    await activate();
    for (const callback of Object.values(callbacks)) expect(callback).toHaveBeenCalledTimes(1);
    await screen.rerender(<Button {...callbacks} isPending>Save</Button>);
    await activate();
    for (const callback of Object.values(callbacks)) expect(callback).toHaveBeenCalledTimes(1);
    await screen.rerender(<Button {...callbacks} isDisabled>Save</Button>);
    await activate();
    for (const callback of Object.values(callbacks)) expect(callback).toHaveBeenCalledTimes(1);
    await screen.rerender(<Button {...callbacks}>Save</Button>);
    await activate();
    for (const callback of Object.values(callbacks)) expect(callback).toHaveBeenCalledTimes(2);
  });

  test("starts a 150ms scale target on touch-down, preserves consumer transforms and retargets on release", async () => {
    jest.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(false);
    const timing = jest.spyOn(Animated, "timing");
    const onPressIn = jest.fn();
    const onPressOut = jest.fn();
    const screen = await render(
      <Button onPressIn={onPressIn} onPressOut={onPressOut}
        style={({ pressed }) => ({ marginTop: pressed ? 12 : 8, opacity: 0.6, transform: [{ rotate: "3deg" }] })}>
        Save
      </Button>
    );
    await fireEvent(screen.getByRole("button"), "pressIn", {});
    const pressed = StyleSheet.flatten(screen.getByRole("button").props.style);
    expect(pressed.marginTop).toBe(12);
    expect(pressed.opacity).toBeCloseTo(0.516);
    expect(pressed.transform[0]).toEqual({ rotate: "3deg" });
    expect(pressed.transform).toHaveLength(2);
    expect(timing).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ toValue: 0.98, duration: 150, useNativeDriver: true }));
    await fireEvent(screen.getByRole("button"), "pressOut", {});
    expect(timing).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ toValue: 1 }));
    expect(onPressIn).toHaveBeenCalledTimes(1);
    expect(onPressOut).toHaveBeenCalledTimes(1);
  });

  test("removes spatial feedback on a live reduced-motion change while preserving pressed opacity", async () => {
    let onChange = (_value: boolean) => {};
    const remove = jest.fn();
    jest.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(false);
    jest.spyOn(AccessibilityInfo, "addEventListener").mockImplementation(((_event: string, callback: (value: boolean) => void) => {
      onChange = callback;
      return { remove };
    }) as unknown as typeof AccessibilityInfo.addEventListener);
    const screen = await render(<Button>Save</Button>);
    await fireEvent(screen.getByRole("button"), "pressIn", {});
    await act(async () => onChange(true));
    const pressed = StyleSheet.flatten(screen.getByRole("button").props.style);
    expect(pressed.transform).toEqual([{ scale: 1 }]);
    expect(pressed.opacity).toBe(0.86);
    await fireEvent(screen.getByRole("button"), "pressOut", {});
    expect(StyleSheet.flatten(screen.getByRole("button").props.style).opacity).toBeUndefined();
    expect(StyleSheet.flatten(screen.getByRole("button").props.style).transform).toEqual([{ scale: 1 }]);
    await screen.unmount();
    expect(remove).toHaveBeenCalledTimes(1);
  });

  test.each([
    ["primary", "bg-[var(--lui-button-primary-background)]"],
    ["secondary", "bg-[var(--learnui-color-surface)]"],
    ["outline", "border-[color:var(--learnui-color-border)]"],
    ["ghost", "bg-transparent"],
    ["destructive", "bg-[var(--lui-button-destructive-background)]"]
  ] as const)("maps the %s public variant", async (variant, expected) => {
    const screen = await render(<Button variant={variant}>Save</Button>);
    expect(screen.getByRole("button").props.className).toContain(expected);
  });

  test.each([["sm", "min-h-11"], ["md", "min-h-12"], ["lg", "min-h-14"]] as const)(
    "maps size %s with at least a 44-point target", async (size, expected) => {
      const screen = await render(<Button size={size}>Save</Button>);
      expect(screen.getByRole("button").props.className).toContain(expected);
      expect(screen.getByRole("button").props.className).toContain("min-w-11");
    }
  );

  test("merges consumer classes last and accepts consumer styles without dropping presentation", async () => {
    const screen = await render(
      <Button className="min-h-20 bg-purple-600" style={{ borderRadius: 24, marginTop: 8 }}>Save</Button>
    );
    const root = screen.getByRole("button");
    expect(root.props.className).toContain("min-h-20");
    expect(root.props.className).toContain("bg-purple-600");
    expect(root.props.className).not.toContain("min-h-12");
    expect(root.props.className).not.toContain("bg-[var(--lui-button-primary-background)]");
    expect(StyleSheet.flatten(root.props.style)).toEqual(expect.objectContaining({ borderRadius: 24, marginTop: 8 }));
  });

  test("requires a name for non-text content and rejects blank icon-only labels in development", async () => {
    const screen = await render(<Button accessibilityLabel="Add lesson"><View /></Button>);
    expect(screen.getByRole("button", { name: "Add lesson" })).toBeTruthy();
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    await expect(render(<Button accessibilityLabel=" "><View /></Button>)).rejects.toThrow(
      "Button requires a non-empty accessibilityLabel for non-text children."
    );
    error.mockRestore();
  });

  test("owns disabled and busy semantics and blocks press and long-press while unavailable", async () => {
    const onPress = jest.fn();
    const onLongPress = jest.fn();
    const conflicting = { role: "link", "aria-disabled": false, "aria-busy": false, accessible: false,
      accessibilityState: { disabled: false, busy: false } };
    const screen = await render(
      <Button {...conflicting} isDisabled onLongPress={onLongPress} onPress={onPress}>Delete lesson</Button>
    );
    const disabled = screen.getByRole("button", { name: "Delete lesson" });
    expect(disabled.props.accessibilityState.disabled).toBe(true);
    await fireEvent.press(disabled);
    await fireEvent(disabled, "longPress");
    expect(onPress).not.toHaveBeenCalled();
    expect(onLongPress).not.toHaveBeenCalled();
    await screen.rerender(<Button isPending onLongPress={onLongPress}>Delete lesson</Button>);
    await fireEvent(screen.getByRole("button"), "longPress");
    expect(onLongPress).not.toHaveBeenCalled();
  });
  test("activates through its public root and keeps that root and action name while pending", async () => {
    const onPress = jest.fn();
    const ref = createRef<View>();
    const screen = await render(<Button onPress={onPress} ref={ref}>Save lesson</Button>);
    const root = screen.getByRole("button", { name: "Save lesson" });
    const nativeRoot = ref.current;
    expect(nativeRoot).not.toBeNull();
    await fireEvent.press(root);
    expect(onPress).toHaveBeenCalledTimes(1);

    await screen.rerender(<Button isPending onPress={onPress} ref={ref}>Save lesson</Button>);
    const pending = screen.getByRole("button", { name: "Save lesson" });
    expect(pending.props.accessibilityState).toEqual({ busy: true, disabled: false });
    expect(pending.props.accessible).toBe(true);
    expect(ref.current).toBe(nativeRoot);
    expect(screen.queryByRole("progressbar")).toBeNull();
    await fireEvent.press(pending);
    await fireEvent.press(pending);
    expect(onPress).toHaveBeenCalledTimes(1);

    await screen.rerender(<Button onPress={onPress} ref={ref}>Save lesson</Button>);
    await fireEvent.press(screen.getByRole("button", { name: "Save lesson" }));
    expect(onPress).toHaveBeenCalledTimes(2);
  });
});
