import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import svgr from "@svgr/rollup";
import packageJson from "./package.json" with { type: "json" };

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      svgr(),
      typescript({
        tsconfig: "./tsconfig.json",
        exclude: ["**/*.test.tsx", "**/*.test.ts", "**/*.stories.ts", "**/*.stories.tsx"],
      }),
    ],
    external: ["react", "react-dom"],
  },
];
