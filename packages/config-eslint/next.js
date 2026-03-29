import nextPlugin from '@next/eslint-plugin-next';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

import baseConfig from './base.js';

/** @type {import("typescript-eslint").ConfigArray} */
export default tseslint.config(
  ...baseConfig,
  // React flat config: handles JSX transform detection and core React rules
  react.configs.flat.recommended,
  // React Hooks: enforce rules of hooks and exhaustive deps
  reactHooks.configs.flat.recommended,
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      // Next.js recommended rules (image, link, font, script optimizations)
      ...nextPlugin.configs.recommended.rules,
      // React 17+ JSX transform — no need to import React in scope
      'react/react-in-jsx-scope': 'off',
      // TypeScript handles prop types
      'react/prop-types': 'off',
      // Explicit any is still an error — override if needed per-file
      '@typescript-eslint/no-require-imports': 'off',
    },
    settings: {
      react: {
        // Auto-detect React version from package.json
        version: 'detect',
      },
    },
  },
);
