import baseConfig from "./base.js";

/** @type {import("typescript-eslint").ConfigArray} */
export default [
  ...baseConfig,
  {
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
