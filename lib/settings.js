/*jshint node: true*/
'use strict';

const fs = require('fs-extra');
const merge = require('merge');
const path = require('path');
const logger = require('@blackbaud/skyux-logger');

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
 * Reads the installed version of skyux2.
 * @name getSkyuxVersion
 * @returns {string} skyuxVersion
 */
function getSkyuxVersion() {
  const skyuxInstalledPath = path.join('node_modules', '@blackbaud', 'skyux', 'package.json');
  const skyuxInstalled = getLocalConfig(skyuxInstalledPath);
  let version;

  // Property changed in npm 5 from spec to rawSpec
  if (skyuxInstalled._requested) {
    if (skyuxInstalled._requested.spec) {
      version = skyuxInstalled._requested.spec;
    }

    if (skyuxInstalled._requested.rawSpec) {
      version = skyuxInstalled._requested.rawSpec;
    }
  }

  if (!version) {
    logger.error('Unable to locate an installation of SKYUX2.');
    return '';
  }

  return version;
}

/**
 * Returns the settings.
 * @name getSettings
 * @returns {Object} settings
 */
function getSettings(argv = {}) {

  const packageConfig = getLocalConfig('package.json');
  const skyuxConfig = getLocalConfig('skyuxconfig.json');
  const logSkyuxVersion = argv.logSkyuxVersion !== 'false' && argv.logSkyuxVersion !== false;

  const defaults = {
    name: '',
    version: '',
    skyuxVersion: logSkyuxVersion ? getSkyuxVersion() : '',
    packageConfig: packageConfig,
    skyuxConfig: skyuxConfig,
    azureStorageTableName: 'spa'
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
