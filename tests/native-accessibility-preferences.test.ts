import { describe, expect, test, vi } from "vitest";

vi.mock("react-native", () => ({
  AccessibilityInfo: {},
  Platform: { OS: "ios" }
}));

import {
  mergeInitialPreferencesWithLiveChanges,
  readAccessibilityPreferences,
  resolveAccessibilityPresentation,
  subscribeToAccessibilityPreferences
} from "../apps/native-gallery/lib/accessibility-preferences";

function createAccessibilityInfo() {
  const listeners = new Map<string, (enabled: boolean) => void>();

  return {
    api: {
      addEventListener: vi.fn((event: string, listener: (enabled: boolean) => void) => {
        listeners.set(event, listener);
        return { remove: vi.fn(() => listeners.delete(event)) };
      }),
      isHighTextContrastEnabled: vi.fn(async () => true),
      isReduceMotionEnabled: vi.fn(async () => true),
      isReduceTransparencyEnabled: vi.fn(async () => true)
    },
    emit(event: string, enabled: boolean) {
      listeners.get(event)?.(enabled);
    }
  };
}

describe("native accessibility preference mapping", () => {
  test("reports only preferences exposed by iOS", async () => {
    const { api } = createAccessibilityInfo();

    await expect(readAccessibilityPreferences("ios", api)).resolves.toEqual({
      isHighContrastEnabled: null,
      isReduceMotionEnabled: true,
      isReduceTransparencyEnabled: true
    });
    expect(api.isHighTextContrastEnabled).not.toHaveBeenCalled();
  });

  test("reports only preferences exposed by Android", async () => {
    const { api } = createAccessibilityInfo();

    await expect(readAccessibilityPreferences("android", api)).resolves.toEqual({
      isHighContrastEnabled: true,
      isReduceMotionEnabled: true,
      isReduceTransparencyEnabled: null
    });
    expect(api.isReduceTransparencyEnabled).not.toHaveBeenCalled();
  });

  test("subscribes only to truthful platform events and cleans them up", () => {
    const { api, emit } = createAccessibilityInfo();
    const onChange = vi.fn();
    const unsubscribe = subscribeToAccessibilityPreferences("android", api, onChange);

    emit("reduceMotionChanged", true);
    emit("highTextContrastChanged", true);
    emit("reduceTransparencyChanged", true);

    expect(onChange).toHaveBeenNthCalledWith(1, { isReduceMotionEnabled: true });
    expect(onChange).toHaveBeenNthCalledWith(2, { isHighContrastEnabled: true });
    expect(api.addEventListener).not.toHaveBeenCalledWith("reduceTransparencyChanged", expect.anything());

    unsubscribe();
    emit("reduceMotionChanged", false);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  test("maps supported preferences to reduced motion and truthful material treatment", () => {
    expect(
      resolveAccessibilityPresentation({
        isHighContrastEnabled: null,
        isReduceMotionEnabled: true,
        isReduceTransparencyEnabled: true
      })
    ).toEqual({
      motion: "reduced",
      surface: "opaque",
      surfaceBorder: "explicit"
    });

    expect(
      resolveAccessibilityPresentation({
        isHighContrastEnabled: true,
        isReduceMotionEnabled: false,
        isReduceTransparencyEnabled: null
      })
    ).toEqual({
      motion: "full",
      surface: "translucent",
      surfaceBorder: "explicit"
    });
  });

  test("keeps live events that arrive before the initial read completes", () => {
    expect(
      mergeInitialPreferencesWithLiveChanges(
        {
          isHighContrastEnabled: true,
          isReduceMotionEnabled: true,
          isReduceTransparencyEnabled: null
        },
        { isReduceMotionEnabled: false }
      )
    ).toEqual({
      isHighContrastEnabled: true,
      isReduceMotionEnabled: false,
      isReduceTransparencyEnabled: null
    });
  });
});
