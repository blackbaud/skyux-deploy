/*jshint node: true*/
'use strict';

const fs = require('fs');
const merge = require('merge');
const path = require('path');
const logger = require('winston');

/**
 * Reads the installed version of skyux2.
 * @name getSkyuxVersion
 * @param {String} cwd
 * @returns {string} skyuxVersion
 */
function getSkyuxVersion(cwd) {
  const skyuxPath = path.resolve(
    cwd,
    'node_modules',
    'blackbaud-skyux2',
    'package.json'
  );

  if (fs.existsSync(skyuxPath)) {
    return require(skyuxPath)._requested.spec;
  }

  logger.error('Unable to locate an installation of SKYUX2.');
  return '';
}

/**
 * Returns the settings.
 * @name getSettings
 * @returns {Object} settings
 */
function getSettings(argv) {
  const cwd = process.cwd();
  const jsonPath = path.join(cwd, 'package.json');
  const json = fs.existsSync(jsonPath) ? require(jsonPath) : {};
  const defaults = {
    name: '',
    version: '',
    skyuxVersion: getSkyuxVersion(cwd),
    azureStorageTableName: 'spa'
  };
  const settings = merge(defaults, json, argv);

  // Force version to be a string (since builds can be numbers)
  settings.version = settings.version.toString();
  return settings;
}

module.exports = {
  getSettings: getSettings
};
