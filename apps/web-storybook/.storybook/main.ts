import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  addons: ["@storybook/addon-a11y", "@storybook/addon-vitest"],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  stories: [
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  typescript: {
    reactDocgen: false
  },
  viteFinal(config) {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        dedupe: [...(config.resolve?.dedupe ?? []), "react", "react-dom"]
      }
    };
  }
};

export default config;
