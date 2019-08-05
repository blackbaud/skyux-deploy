'use strict';

const semver = require('semver');
const logger = require('@blackbaud/skyux-logger');

/**
 * Contains the logic if the major version should be updated.
 * This is used when pushing to blob and table storage.
 * @name getValidMajorVersion
 * @param {string} version
 * @returns {string} version
 */
function getValidMajorVersion(version) {
  if (semver.valid(version) && !semver.prerelease(version)) {
    return semver.major(version).toString();
  }
}

/**
 * Allows errors to be recorded via one-line.
 * Handles the most-common
 * @name handleError
 * @param [Error] {error}
 */
function handleError(error) {
  if (error) {
    if (error.toString().indexOf('already exists') > -1) {
      logger.error('Already been registered in table storage.');
    } else {
      logger.error(error);
    }
  }
}

/**
 * Calls the reject method with the specific error.
 * @name rejectIfError
 * @param {Function} reject
 * @param {string} [error]
 * @returns null;
 */
function rejectIfError(reject, error) {
  if (error) {
    logger.error(error);
    reject(error);
  }
}

/**
 * Validates any required settings.
 * @name validate
 * @param {Array} assets
 * @param {Object} settings
 * @returns {Boolean} isValid
 */
function validate(assets, settings) {
  const required = [
    'name',
    'version',
    'azureStorageAccount',
    'azureStorageAccessKey',
    'azureStorageTableName',
    'isStaticClient'
  ];
  let success = true;

  if (assets.length === 0) {
    logger.error('Unable to find any matching assets in SPA %s.', settings.name);
    success = false;
  }

  required.forEach((key) => {
    if (!settings[key]) {
      logger.error('%s is required.', key);
      success = false;
    }
  });

  return success;
}

module.exports = {
  getValidMajorVersion,
  handleError,
  rejectIfError,
  validate
};
