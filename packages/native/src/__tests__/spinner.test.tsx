import { createRef } from "react";
import {
  AccessibilityInfo,
  Animated,
  View,
  type AccessibilityChangeEventName,
  type ViewProps
} from "react-native";
import { act, render, waitFor } from "@testing-library/react-native";
import { useCSSVariable } from "uniwind";

import { Spinner } from "@learnui/native";

const mockUseCSSVariable = jest.mocked(useCSSVariable);

describe("Spinner", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("exposes standalone indeterminate progress semantics from the public entry", async () => {
    const conflictingSemantics = {
      "aria-valuenow": 50,
      accessibilityValue: { max: 100, min: 0, now: 50 },
      role: "button"
    } as unknown as Record<string, unknown>;
    const screen = await render(<Spinner {...conflictingSemantics} label="Loading lessons" />);
    const root = screen.getByRole("progressbar", { name: "Loading lessons" });

    expect(root.props.accessibilityState).toEqual({ busy: true });
    expect(root.props.accessibilityValue).toBeUndefined();
    expect(root.props["aria-valuenow"]).toBeUndefined();
    expect(root.props.role).toBeUndefined();
    expect(screen.getAllByRole("progressbar")).toHaveLength(1);
  });

  test("keeps embedded use decorative without a second accessible root", async () => {
    const conflictingSemantics = {
      accessibilityLabel: "Duplicate loading status",
      accessibilityRole: "progressbar",
      accessible: true
    } as unknown as Record<string, unknown>;
    const screen = await render(<Spinner {...conflictingSemantics} isDecorative />);

    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.root?.props.accessible).toBe(false);
    expect(screen.root?.props.accessibilityElementsHidden).toBe(true);
    expect(screen.root?.props.importantForAccessibility).toBe("no-hide-descendants");
  });

  test("forwards its root ref", async () => {
    const ref = createRef<React.ElementRef<typeof View>>();

    await render(<Spinner label="Loading lessons" ref={ref} />);

    expect(ref.current).not.toBeNull();
  });

  test("hides the visual indicator from accessibility", async () => {
    const screen = await render(<Spinner label="Loading lessons" />);
    const root = screen.getByRole("progressbar");
    const visual = root.children[0] as { props: Record<string, unknown> };

    expect(visual.props.accessible).toBe(false);
    expect(visual.props.accessibilityElementsHidden).toBe(true);
    expect(visual.props.importantForAccessibility).toBe("no-hide-descendants");
  });

  test("keeps Uniwind layout classes on a native View inside the animated wrapper", async () => {
    const screen = await render(<Spinner color="accent" label="Loading lessons" />);
    const animatedWrapper = screen.getByRole("progressbar").children[0] as {
      children: Array<{ props: Record<string, unknown> }>;
      props: Record<string, unknown>;
    };
    const visual = animatedWrapper.children[0];

    expect(animatedWrapper.props.className).toBeUndefined();
    expect(animatedWrapper.props.style).toEqual(
      expect.objectContaining({ height: "100%", width: "100%" })
    );
    expect(visual.props.className).toContain("border-b-transparent");
    expect(visual.props.className).toContain("border-l-transparent");
    expect(visual.props.className).not.toContain("border-transparent");
  });

  test.each([
    ["sm", "h-4 w-4"],
    ["md", "h-5 w-5"],
    ["lg", "h-6 w-6"]
  ] as const)("maps the %s size", async (size, expectedClassName) => {
    const screen = await render(<Spinner label="Loading lessons" size={size} />);

    expect(screen.getByRole("progressbar").props.className).toContain(expectedClassName);
  });

  test.each([
    ["neutral", "--learnui-color-muted"],
    ["accent", "--learnui-color-accent"],
    ["success", "--learnui-color-success"],
    ["warning", "--learnui-color-warning"],
    ["destructive", "--learnui-color-destructive"]
  ] as const)("resolves the %s color token for native border styles", async (color, token) => {
    const screen = await render(<Spinner color={color} label="Loading lessons" />);
    const animatedWrapper = screen.getByRole("progressbar").children[0] as {
      children: Array<{ props: Record<string, unknown> }>;
    };
    const visual = animatedWrapper.children[0];

    expect(mockUseCSSVariable).toHaveBeenLastCalledWith(token);
    expect(visual.props.style).toEqual({
      borderBottomColor: "transparent",
      borderLeftColor: "transparent",
      borderRightColor: `resolved:${token}`,
      borderTopColor: `resolved:${token}`
    });
  });

  test("merges consumer className last and preserves consumer style precedence", async () => {
    const consumerStyle = { height: 40, opacity: 0.6 } as const;
    const screen = await render(
      <Spinner className="h-10 w-10" label="Loading lessons" style={consumerStyle} />
    );
    const root = screen.getByRole("progressbar");

    expect(root.props.className).toContain("h-10");
    expect(root.props.className).toContain("w-10");
    expect(root.props.className).not.toContain("h-5");
    expect(root.props.className).not.toContain("w-5");
    expect((root.props as ViewProps).style).toEqual(consumerStyle);
  });

  test("rotates continuously and switches to a static fallback when system motion is reduced", async () => {
    let onReduceMotionChange = (_isEnabled: boolean) => {};
    const remove = jest.fn();
    const start = jest.fn();
    const stop = jest.fn();
    jest.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(false);
    jest.spyOn(AccessibilityInfo, "addEventListener").mockImplementation(
      ((event: AccessibilityChangeEventName, listener: (isEnabled: boolean) => void) => {
        if (event === "reduceMotionChanged") onReduceMotionChange = listener;
        return { remove };
      }) as unknown as typeof AccessibilityInfo.addEventListener
    );
    jest
      .spyOn(Animated, "loop")
      .mockReturnValue({ reset: jest.fn(), start, stop } as unknown as Animated.CompositeAnimation);
    const screen = await render(<Spinner label="Loading lessons" />);

    await waitFor(() => expect(start).toHaveBeenCalledTimes(1));

    await act(async () => onReduceMotionChange(true));

    await waitFor(() => expect(stop).toHaveBeenCalledTimes(1));
    const visual = screen.getByRole("progressbar").children[0] as {
      props: Record<string, unknown>;
    };
    expect(visual.props.style).toEqual({ height: "100%", opacity: 0.72, width: "100%" });

    await screen.unmount();
    expect(remove).toHaveBeenCalledTimes(1);
  });
});
