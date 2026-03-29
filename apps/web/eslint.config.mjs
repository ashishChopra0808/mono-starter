import nextConfig from '@mono/config-eslint/next';
import globals from 'globals';

export default [
  {
    ignores: ['.next/**', 'dist/**', 'out/**', 'node_modules/**', 'next.config.js'],
  },
  ...nextConfig,
  // Browser globals for Next.js client components
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
];
