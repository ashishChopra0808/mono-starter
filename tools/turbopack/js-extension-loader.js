const fs = require('fs');
const path = require('path');

/**
 * Turbopack loader that strips `.js` extensions from relative import
 * specifiers when the `.js` file doesn't actually exist on disk.
 *
 * Needed because Turbopack lacks webpack's `resolve.extensionAlias` and
 * our workspace packages use `.js` extensions (ESM convention with nodenext).
 */
module.exports = function jsExtensionLoader(source) {
  const dir = path.dirname(this.resourcePath);

  return source.replace(
    /(from\s+['"])(\.[^'"]*)(\.js)(['"])/g,
    (_match, prefix, importPath, _ext, suffix) => {
      const jsPath = path.resolve(dir, importPath + '.js');
      if (fs.existsSync(jsPath)) return _match;
      return `${prefix}${importPath}${suffix}`;
    },
  );
};
