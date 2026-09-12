import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = fileURLToPath(new URL("../apps/web-storybook/", import.meta.url));
const { chromium, firefox, webkit } = createRequire(`${root}/package.json`)("playwright");
const directory = resolve(root, "storybook-static");
const server = createServer(async (request, response) => {
  const path = resolve(directory, `.${new URL(request.url, "http://localhost").pathname}`);
  if (!path.startsWith(`${directory}/`)) { response.writeHead(403).end(); return; }
  try {
    const content = await readFile(path);
    const types = { ".js": "text/javascript", ".css": "text/css", ".html": "text/html", ".json": "application/json" };
    response.setHeader("Content-Type", types[extname(path)] ?? "application/octet-stream");
    response.end(content);
  } catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const url = `http://127.0.0.1:${server.address().port}/iframe.html?id=components-card--composition&viewMode=story`;
try {
  for (const engine of [chromium, firefox, webkit].filter(engine => !process.env.CARD_BROWSER || process.env.CARD_BROWSER === engine.name())) {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage({ viewport: { width: 640, height: 900 } });
      await page.goto(url);
      await page.locator(".learnui-card").first().waitFor();
      for (const theme of ["light", "dark"]) {
        await page.emulateMedia({ contrast: "more", reducedMotion: "reduce", forcedColors: "none" });
        await page.reload();
        await page.locator(".learnui-card").first().waitFor();
        await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
        if (await page.evaluate(() => matchMedia("(prefers-contrast: more)").matches)) {
          await page.waitForFunction(() => {
            const node = document.querySelector(".learnui-card");
            return node && parseFloat(getComputedStyle(node).borderTopWidth) >= 2;
          });
        }
        const contrast = await page.locator(".learnui-card").first().evaluate(node => {
          const style = getComputedStyle(node);
          return { width: parseFloat(style.borderTopWidth), border: style.borderTopColor, text: style.color };
        });
        if (await page.evaluate(() => matchMedia("(prefers-contrast: more)").matches)) {
          assert(contrast.width >= 2, `${engine.name()} contrast: ${JSON.stringify(contrast)}`);
          assert.equal(contrast.border, contrast.text);
        } else {
          console.log(`${engine.name()}: prefers-contrast emulation unavailable; unverified on this engine`);
        }
        await page.emulateMedia({ contrast: "no-preference", forcedColors: "active" });
        if (await page.evaluate(() => matchMedia("(forced-colors: active)").matches)) {
          const colors = await page.locator(".learnui-card").first().evaluate(node => {
            const probe = document.createElement("div");
            probe.style.color = "CanvasText";
            document.body.append(probe);
            const expected = getComputedStyle(probe).color;
            probe.remove();
            const style = getComputedStyle(node);
            return { border: style.borderTopColor, background: style.backgroundColor, text: style.color, expected };
          });
          assert.equal(colors.border, colors.expected);
          assert.notEqual(colors.background, colors.text);
        }
        await page.emulateMedia({ forcedColors: "none" });
      }
      await page.goto(url.replace("--composition", "--consumer-override-and-long-content"));
      await page.locator(".card-override").waitFor();
      await page.evaluate(() => { document.documentElement.style.fontSize = "32px"; });
      const overflow = await page.locator(".card-override").evaluate(node => node.scrollWidth > node.clientWidth);
      assert.equal(overflow, false, "200% text must reflow");
      if (engine === chromium) {
        const cdp = await page.context().newCDPSession(page);
        await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-transparency", value: "reduce" }] });
        assert(await page.evaluate(() => matchMedia("(prefers-reduced-transparency: reduce)").matches));
        const colors = await page.locator(".card-override").evaluate(node => {
          const probe = document.createElement("div");
          probe.style.backgroundColor = "var(--learnui-color-elevated)";
          document.body.append(probe);
          const expected = getComputedStyle(probe).backgroundColor;
          probe.remove();
          return { actual: getComputedStyle(node).backgroundColor, expected };
        });
        assert.equal(colors.actual, colors.expected, "reduced transparency uses elevated token");
      }
      console.log(`${engine.name()}: Card light/dark contrast, supported forced colors, 200% text passed`);
    } finally { await browser.close(); }
  }
} finally { await new Promise(resolve => server.close(resolve)); }
