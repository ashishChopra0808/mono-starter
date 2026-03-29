import baseConfig from "./base.js";

/** @type {import("typescript-eslint").ConfigArray} */
export default [
  ...baseConfig,
  {
    rules: {
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "warn",
    },
  },
];
