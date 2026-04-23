import baseConfig from '@mono/config-eslint/base';

/** @type {import("typescript-eslint").ConfigArray} */
export default [
  { ignores: ['dist/'] },
  ...baseConfig,
];
