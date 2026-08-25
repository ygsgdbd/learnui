import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  stories: [
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  typescript: {
    reactDocgen: false
  }
};

export default config;
