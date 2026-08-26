import { describe, expect, test } from "vitest";

import * as nativeStyles from "../packages/native/src/internal/styles";
import * as webStyles from "../packages/web/src/internal/styles";

const helpers = [
  ["web", webStyles],
  ["native", nativeStyles]
] as const;

describe.each(helpers)("%s package styling helpers", (_platform, { cn, tv }) => {
  test("merge conflicting consumer classes last", () => {
    expect(cn("px-2 text-sm", "px-6 text-lg")).toBe("px-6 text-lg");
  });

  test("support typed variants, slots, compound rules, and consumer overrides", () => {
    const field = tv({
      slots: {
        root: "rounded-md border px-2",
        label: "text-sm"
      },
      variants: {
        isInvalid: {
          true: {
            root: "border-red-500",
            label: "text-red-700"
          }
        },
        size: {
          sm: { root: "min-h-8" },
          md: { root: "min-h-10" }
        }
      },
      compoundVariants: [
        {
          isInvalid: true,
          size: "md",
          class: { root: "ring-2" }
        }
      ],
      defaultVariants: { size: "md" }
    });

    const slots = field({ isInvalid: true });

    const root = slots.root({ class: "px-8" });

    expect(root).toContain("min-h-10");
    expect(root).toContain("border-red-500");
    expect(root).toContain("ring-2");
    expect(root.endsWith("px-8")).toBe(true);
    expect(slots.label()).toBe("text-sm text-red-700");
  });
});

test("native consumer style remains last, including animated style objects", () => {
  const generatedStyle = { opacity: 0.72 };
  const animatedConsumerStyle = { opacity: 1, transform: [{ scale: 1.02 }] };

  expect(nativeStyles.mergeStylesWithConsumerOverride(generatedStyle, animatedConsumerStyle)).toEqual([
    generatedStyle,
    animatedConsumerStyle
  ]);
});
