import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  server: { port: 3000 },
  resolve: {
    alias: {
      "reactive-cursors": path.resolve(__dirname, "../package/src/component/index.tsx"),
    },
  },
});
