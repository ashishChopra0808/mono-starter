import nestConfig from '@mono/config-eslint/nest';
import globals from 'globals';

export default [
  // Ignore generated and tool files
  {
    ignores: ['dist/**', 'webpack.config.js'],
  },
  ...nestConfig,
  // Provide Node.js globals for all API source files
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
