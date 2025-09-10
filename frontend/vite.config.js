import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import svgr from "vite-plugin-svgr";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vanillaExtractPlugin(), svgr()],
  server: { port: 3000 },
  resolve: {
    alias: {
      "reactive-cursors": path.resolve(
        __dirname,
        "../package/src/component/index.tsx"
      ),
    },
  },
});
