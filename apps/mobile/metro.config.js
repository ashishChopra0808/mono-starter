const { withNxMetro } = require('@nx/expo');
const { getDefaultConfig } = require('@expo/metro-config');
const { mergeConfig } = require('metro-config');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '../..');
const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const customConfig = {
  cacheVersion: 'mobile',
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...sourceExts, 'cjs', 'mjs', 'svg'],
    unstable_enableSymlinks: true,
    unstable_enablePackageExports: true,
  },
};

const nxMetroConfig = withNxMetro(mergeConfig(defaultConfig, customConfig), {
  debug: false,
  extensions: [],
  watchFolders: [],
});

// Wrap the NX resolver to handle .js → .ts/.tsx for workspace packages
// (withNxMetro replaces resolveRequest, so we must wrap after it)
const nxResolveRequest = nxMetroConfig.resolver.resolveRequest;
nxMetroConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('.') && moduleName.endsWith('.js')) {
    const stripped = moduleName.slice(0, -3);
    for (const ext of ['.ts', '.tsx']) {
      try {
        return nxResolveRequest(
          { ...context, resolveRequest: nxResolveRequest },
          stripped + ext,
          platform,
        );
      } catch {}
    }
  }
  return nxResolveRequest(context, moduleName, platform);
};

module.exports = nxMetroConfig;
