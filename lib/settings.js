'use strict';

const fs = require('fs-extra');
const merge = require('merge');
const path = require('path');

/**
 * If the requested file exists, returns it.
 * @name getLocalConfig
 * @param {string} filename
 * @returns {Object} config
 */
function getLocalConfig(filename) {
  const filepath = path.join(process.cwd(), filename);

  if (fs.existsSync(filepath)) {
    return fs.readJsonSync(filepath, 'utf8');
  } else {
    return {};
  }
}

/**
 * Returns the settings.
 * @name getSettings
 * @returns {Object} settings
 */
function getSettings(argv = {}) {

  const packageConfig = getLocalConfig('package.json');
  const skyuxConfig = getLocalConfig('skyuxconfig.json');

  const defaults = {
    name: '',
    version: '',
    packageConfig: packageConfig,
    skyuxConfig: skyuxConfig,
    azureStorageTableName: 'spa',
    isStaticClient: false
  };

  // Merges in all packageConfig, really only care about name + version
  const settings = merge(defaults, packageConfig, argv);

  // Force version to be a string (since builds can be numbers)
  settings.version = settings.version.toString();
  return settings;
}

module.exports = {
  getSettings: getSettings
};
