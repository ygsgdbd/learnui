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

export default defineConfig({
  test: {
    projects: [
      {
        optimizeDeps: {
          include: ["storybook/test"]
        },
        plugins: [storybookTest({ configDir })],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            instances: [
              { browser: "chromium", provider: targetScaleProvider() },
              { browser: "firefox", provider: targetScaleProvider() },
              { browser: "webkit", provider: targetScaleProvider() }
            ]
          }
        }
      }
    ]
  }
});
