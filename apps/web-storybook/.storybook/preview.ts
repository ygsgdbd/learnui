import "@learnui/web/styles";

import type { Preview } from "@storybook/react-vite";

type ThemeMode = "system" | "light" | "dark";

const preview: Preview = {
  initialGlobals: {
    theme: "system"
  },
  globalTypes: {
    theme: {
      description: "LearnUI theme preview",
      toolbar: {
        icon: "contrast",
        items: [
          { title: "System", value: "system" },
          { title: "Light", value: "light" },
          { title: "Dark", value: "dark" }
        ]
      }
    }
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme as ThemeMode;

      if (theme === "system") {
        delete document.documentElement.dataset.theme;
      } else {
        document.documentElement.dataset.theme = theme;
      }

      return Story();
    }
  ]
};

export default preview;
