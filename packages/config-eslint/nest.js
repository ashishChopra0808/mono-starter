import tseslint from 'typescript-eslint';

import baseConfig from './base.js';

/** @type {import("typescript-eslint").ConfigArray} */
export default tseslint.config(...baseConfig, {
  rules: {
    // NestJS uses emitDecoratorMetadata — class imports must remain value imports
    // for Angular/NestJS DI reflection to work. `import type` breaks this.
    '@typescript-eslint/consistent-type-imports': 'off',
    // NestJS controllers and services must have explicit return types
    // — makes API boundaries immediately obvious
    '@typescript-eslint/explicit-function-return-type': [
      'error',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      },
    ],
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    // NestJS decorators and providers often use class members without explicit access modifiers
    '@typescript-eslint/no-explicit-any': 'error',
  },
});
