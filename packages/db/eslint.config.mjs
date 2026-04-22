import baseConfig from '@mono/config-eslint/base';

/** @type {import("typescript-eslint").ConfigArray} */
export default [
  // Ignore build output and generated migration SQL
  { ignores: ['dist/', 'src/drizzle/'] },
  ...baseConfig,
  // CLI scripts and tests intentionally use console for user-facing output
  {
    files: ['src/migrate.ts', 'src/seed.ts', 'src/__tests__/**'],
    rules: {
      'no-console': 'off',
    },
  },
];
