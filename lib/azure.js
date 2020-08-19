'use strict';

const azure = require('azure-storage');
const logger = require('@blackbaud/skyux-logger');
const utils = require('./utils');

/**
 * For each asset, register it to blob storage.
 * @name registerAssetsToBlob
 * @param {Array} assets
 * @param {Object} settings
 * @returns {Function} promise
 */
function registerAssetsToBlob(settings, assets) {
  const blob = azure.createBlobService(
    settings.azureStorageAccount,
    settings.azureStorageAccessKey
  );
  const acl = { publicAccessLevel: 'blob' };

  function insert(asset) {
    return new Promise((resolve, reject) => {
      logger.info('Creating blob for %s', asset.name);

      function callback(err) {
        utils.rejectIfError(reject, err);
        resolve();
      }

      if (asset.content) {
        const options = {
          contentSettings: {
            contentType: 'application/x-javascript'
          }
        };
        blob.createBlockBlobFromText(settings.name, asset.name, asset.content, options, callback);
      } else if (asset.file) {
        blob.createBlockBlobFromLocalFile(settings.name, asset.name, asset.file, callback);
      } else {
        callback('Unknown asset type.');
      }

    });
  }

  return new Promise((fnResolve, fnReject) => {
    logger.info('Verifying container %s', settings.name);
    if (!assets) {
      fnReject('Assets are required.');
    }

    blob.createContainerIfNotExists(settings.name, acl, async (error) => {
      utils.rejectIfError(fnReject, error);

      try {
        for (let i = 0; i < assets.length; i++) {
          await insert(assets[i]);
        }

        logger.info('SPA %s registered in blob storage.', settings.name);
        fnResolve();
      } catch (err) {
        logger.error(err);
        fnReject(err);
      }
    });
  });
}

/**
 * Inserts or replaces an entity in Table Storage.
 * @name registerEntityToTable
 * @param {Object} settings
 * @param {Entity} entity
 * @returns {Function} promise
 */
function registerEntityToTable(settings, entity) {
  const table = azure.createTableService(
    settings.azureStorageAccount,
    settings.azureStorageAccessKey
  );

  return new Promise((resolve, reject) => {
    logger.info('Verifying table %s', settings.azureStorageTableName);
    table.createTableIfNotExists(settings.azureStorageTableName, (errorTable) => {
      utils.rejectIfError(reject, errorTable);
      table.insertOrReplaceEntity(settings.azureStorageTableName, entity, (errorEntity) => {
        utils.rejectIfError(reject, errorEntity);
        logger.info('SPA %s registered in table storage.', settings.name);
        resolve();
      });
    });
  });
}

module.exports = {
  generator: azure.TableUtilities.entityGenerator,
  registerAssetsToBlob: registerAssetsToBlob,
  registerEntityToTable: registerEntityToTable
};
