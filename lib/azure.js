'use strict';

const azure = require('azure-storage');
const logger = require('@blackbaud/skyux-logger');
const utils = require('./utils');

function getContentTypeForTextFile(fileName) {
  const parts = fileName.split('.');
  const ext = parts.length > 1 ? parts[parts.length - 1] : '';

  // This should probably be smarter and account for more content types,
  // but falling back to application/javascript preserves the old behavior
  // of always setting this content type regardless of the file type. As
  // more types of text assets are published to blob storage, they should
  // be added here.
  switch (ext.toUpperCase()) {
    case 'CSS':
      return 'text/css';
  }

  return 'application/javascript';
}

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
        const contentType = getContentTypeForTextFile(asset.name);

        logger.info('Setting content type to %s for blob %s', contentType, asset.name);

        const options = {
          contentSettings: {
            contentType
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
