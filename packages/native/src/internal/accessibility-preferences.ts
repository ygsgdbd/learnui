import { AccessibilityInfo, Platform } from "react-native";

type PlatformName = typeof Platform.OS;

type AccessibilityInfoApi = Pick<
  typeof AccessibilityInfo,
  | "addEventListener"
  | "isHighTextContrastEnabled"
  | "isReduceMotionEnabled"
  | "isReduceTransparencyEnabled"
>;

export type AccessibilityPreferences = {
  isHighContrastEnabled: boolean | null;
  isReduceMotionEnabled: boolean;
  isReduceTransparencyEnabled: boolean | null;
};

export type AccessibilityPreferenceChange = Partial<AccessibilityPreferences>;

export type AccessibilityPresentation = {
  motion: "full" | "reduced";
  surface: "translucent" | "opaque";
  surfaceBorder: "subtle" | "explicit";
};

export function resolveAccessibilityPresentation(
  preferences: AccessibilityPreferences
): AccessibilityPresentation {
  return {
    motion: preferences.isReduceMotionEnabled ? "reduced" : "full",
    surface: preferences.isReduceTransparencyEnabled ? "opaque" : "translucent",
    surfaceBorder:
      preferences.isReduceTransparencyEnabled || preferences.isHighContrastEnabled ? "explicit" : "subtle"
  };
}

export async function readAccessibilityPreferences(
  platform: PlatformName = Platform.OS,
  accessibilityInfo: AccessibilityInfoApi = AccessibilityInfo
): Promise<AccessibilityPreferences> {
  const [isReduceMotionEnabled, isReduceTransparencyEnabled, isHighContrastEnabled] = await Promise.all([
    accessibilityInfo.isReduceMotionEnabled(),
    platform === "ios" ? accessibilityInfo.isReduceTransparencyEnabled() : null,
    platform === "android" ? accessibilityInfo.isHighTextContrastEnabled() : null
  ]);

  return {
    isHighContrastEnabled,
    isReduceMotionEnabled,
    isReduceTransparencyEnabled
  };
}

export function subscribeToAccessibilityPreferences(
  platform: PlatformName = Platform.OS,
  accessibilityInfo: AccessibilityInfoApi = AccessibilityInfo,
  onChange: (change: AccessibilityPreferenceChange) => void
): () => void {
  const subscriptions = [
    accessibilityInfo.addEventListener("reduceMotionChanged", (isReduceMotionEnabled) => {
      onChange({ isReduceMotionEnabled });
    })
  ];

  if (platform === "ios") {
    subscriptions.push(
      accessibilityInfo.addEventListener("reduceTransparencyChanged", (isReduceTransparencyEnabled) => {
        onChange({ isReduceTransparencyEnabled });
      })
    );
  }

  if (platform === "android") {
    subscriptions.push(
      accessibilityInfo.addEventListener("highTextContrastChanged", (isHighContrastEnabled) => {
        onChange({ isHighContrastEnabled });
      })
    );
  }

  return () => {
    for (const subscription of subscriptions) subscription.remove();
  };
}
