// Root ESLint config — covers workspace tooling and shared packages.
// Apps define their own eslint.config.mjs that extends the appropriate preset.
import baseConfig from '@mono/config-eslint/base';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/.expo/**',
      '**/coverage/**',
      '**/*.tsbuildinfo',
      '**/.nx/**',
      'pnpm-lock.yaml',
    ],
  },
  ...baseConfig,
];
