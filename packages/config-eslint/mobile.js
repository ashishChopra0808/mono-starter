import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

import baseConfig from './base.js';

/** @type {import("typescript-eslint").ConfigArray} */
export default tseslint.config(
  ...baseConfig,
  // React flat config — same rules apply for React Native components
  react.configs.flat.recommended,
  // React Hooks — mandatory in React Native just as in web
  reactHooks.configs.flat.recommended,
  {
    rules: {
      // React Native uses JSX without a browser DOM — no need for react-in-jsx-scope
      'react/react-in-jsx-scope': 'off',
      // TypeScript handles prop types in React Native too
      'react/prop-types': 'off',
      // React Native allows require() for assets (images, fonts)
      '@typescript-eslint/no-require-imports': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
);
