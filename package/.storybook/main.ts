import type { StorybookConfig } from "@storybook/react-vite";

import { join, dirname } from "path";
import { mergeConfig } from "vite";
import svgr from "vite-plugin-svgr";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [getAbsolutePath("@storybook/addon-docs")],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
  async viteFinal(configVite) {
    return mergeConfig(configVite, {
      plugins: [
        svgr({
          include: "**/*.svg",
        }),
      ],
    });
  },
};
export default config;
