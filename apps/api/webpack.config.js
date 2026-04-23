const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

/**
 * Modules that must be externalized from the webpack bundle.
 * These use Node.js features (native addons, worker threads, etc.)
 * that are incompatible with webpack's module resolution.
 */
const nodeExternals = [
  // Pino logging (uses worker threads)
  'pino',
  'pino-pretty',
  'pino/file',
  'thread-stream',
  'sonic-boom',
  // Postgres.js driver (uses native TCP sockets)
  'postgres',
  // bcrypt (native C++ addon)
  'bcrypt',
];

module.exports = {
  output: {
    path: join(__dirname, 'dist'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  externals: [
    ({ request }, callback) => {
      if (nodeExternals.some((mod) => request === mod || request.startsWith(mod + '/'))) {
        return callback(null, `commonjs ${request}`);
      }
      callback();
    },
  ],
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: false,
      sourceMap: true,
      mergeExternals: true,
    }),
  ],
};
