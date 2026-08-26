import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

const root = fileURLToPath(new URL("..", import.meta.url));

const publicTokens = {
  "--learnui-color-canvas": ["#f5f5f7", "#000000"],
  "--learnui-color-surface": ["rgba(255, 255, 255, 0.82)", "rgba(28, 28, 30, 0.86)"],
  "--learnui-color-elevated": ["#ffffff", "#1c1c1e"],
  "--learnui-color-foreground": ["#1d1d1f", "#f5f5f7"],
  "--learnui-color-muted": ["#6e6e73", "#a1a1a6"],
  "--learnui-color-border": ["rgba(0, 0, 0, 0.10)", "rgba(255, 255, 255, 0.14)"],
  "--learnui-color-accent": ["#0071e3", "#0a84ff"],
  "--learnui-color-accent-foreground": ["#ffffff", "#ffffff"],
  "--learnui-color-destructive": ["#d70015", "#ff453a"],
  "--learnui-color-success": ["#248a3d", "#30d158"],
  "--learnui-color-warning": ["#a96500", "#ffb340"],
  "--learnui-color-focus-ring": ["rgba(8, 120, 249, .42)", "rgba(10, 132, 255, .54)"],
  "--learnui-font-sans": [
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  ],
  "--learnui-radius-control": ["12px", "12px"],
  "--learnui-radius-surface": ["22px", "22px"],
  "--learnui-shadow-surface": [
    "0 8px 24px rgba(25, 31, 40, .08)",
    "0 10px 30px rgba(0, 0, 0, .32)"
  ]
} as const;

const tokenNames = Object.keys(publicTokens).sort();

function readStyles(relativePath: string): string {
  return readFileSync(`${root}/${relativePath}`, "utf8");
}

function extractBlock(css: string, selector: string, from = 0): string {
  const selectorStart = css.indexOf(selector, from);
  expect(selectorStart, `missing ${selector}`).toBeGreaterThanOrEqual(0);

  const openingBrace = css.indexOf("{", selectorStart);
  let depth = 0;

  for (let index = openingBrace; index < css.length; index += 1) {
    if (css[index] === "{") depth += 1;
    if (css[index] === "}") depth -= 1;
    if (depth === 0) return css.slice(openingBrace + 1, index);
  }

  throw new Error(`unclosed ${selector} block`);
}

function expectTheme(block: string, mode: 0 | 1): void {
  const declarations = new Map(
    [...block.matchAll(/(--learnui-[\w-]+):\s*([^;]+);/g)].map((match) => [match[1], match[2].trim()])
  );

  expect([...declarations.keys()].sort()).toEqual(tokenNames);

  for (const [name, values] of Object.entries(publicTokens)) {
    expect(declarations.get(name), `${name} ${mode === 0 ? "light" : "dark"} default`).toBe(values[mode]);
  }
}

describe("public theme contract", () => {
  test("both packages expose the exhaustive accepted token defaults", () => {
    const web = readStyles("packages/web/src/styles.css");
    const native = readStyles("packages/native/src/styles.css");

    for (const css of [web, native]) {
      expect([...new Set(css.match(/--learnui-[\w-]+/g) ?? [])].sort()).toEqual(tokenNames);
    }

    expectTheme(extractBlock(web, ":root {"), 0);
    expectTheme(extractBlock(web, ':root[data-theme="light"]'), 0);
    const systemDarkStart = web.indexOf("@media (prefers-color-scheme: dark)");
    expectTheme(extractBlock(web, ':root:not([data-theme="light"])', systemDarkStart), 1);
    expectTheme(extractBlock(web, ':root[data-theme="dark"]'), 1);
    expectTheme(extractBlock(native, ":root {"), 0);
    expectTheme(extractBlock(native, ".dark"), 1);
  });

  test("web maps supported accessibility preferences without coupling them to dark mode", () => {
    const web = readStyles("packages/web/src/styles.css");

    expect(web).toContain("@media (prefers-reduced-motion: reduce)");
    expect(web).toContain("@media (prefers-reduced-transparency: reduce)");
    expect(web).toContain("@media (prefers-contrast: more)");

    const dark = extractBlock(web, ':root[data-theme="dark"]');
    expect(dark).not.toContain("reduced");
    expect(dark).not.toContain("contrast");
  });
});
