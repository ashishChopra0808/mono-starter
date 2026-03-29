import mobileConfig from '@mono/config-eslint/mobile';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/**', '.expo/**', 'dist/**'],
  },
  ...mobileConfig,
  // React Native runs in a custom JS engine — provide common globals
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
