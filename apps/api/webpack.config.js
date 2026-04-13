const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

const pinoExternals = [
  'pino',
  'pino-pretty',
  'pino/file',
  'thread-stream',
  'sonic-boom',
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
      if (pinoExternals.some((mod) => request === mod || request.startsWith(mod + '/'))) {
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
