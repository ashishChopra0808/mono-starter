import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

/** @type {import("typescript-eslint").ConfigArray} */
export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // Unused variables are almost always bugs or dead code — hard error
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Explicit `any` defeats TypeScript's purpose — hard error, escape with a comment
      '@typescript-eslint/no-explicit-any': 'error',
      // Enforce `import type` for type-only imports (reduces bundle overhead)
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      // Non-null assertions are dangerous and should be reviewed
      '@typescript-eslint/no-non-null-assertion': 'warn',
      // Prefer interfaces for object shapes in type position
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      // Import ordering — auto-fixable, reduces diff noise
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      // Console calls should be cleaned up before merging
      'no-console': 'warn',
    },
  },
  // Must be last — disables ESLint formatting rules that conflict with Prettier
  prettierConfig,
);
