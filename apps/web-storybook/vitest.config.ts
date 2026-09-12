import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const configDir = join(dirname(fileURLToPath(import.meta.url)), ".storybook");
const targetScaleProvider = () => playwright({
  contextOptions: {
    deviceScaleFactor: 2
  }
});

const reducedMotionProvider = () => playwright({
  contextOptions: {
    deviceScaleFactor: 2,
    reducedMotion: "reduce"
  }
});

export default defineConfig({
  test: {
    projects: [
      {
        optimizeDeps: {
          include: ["storybook/test", "react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"]
        },
        plugins: [storybookTest({ configDir })],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            instances: [
              { browser: "chromium", name: "chromium", provider: targetScaleProvider() },
              {
                browser: "chromium",
                name: "chromium-reduced-motion",
                provider: reducedMotionProvider()
              },
              { browser: "firefox", name: "firefox", provider: targetScaleProvider() },
              { browser: "webkit", name: "webkit", provider: targetScaleProvider() }
            ]
          }
        }
      }
    ]
  }
});
