'use strict';

const azureBlob = require('@azure/storage-blob');
const azureTables = require('@azure/data-tables');
const mime = require('mime-types');
const logger = require('@blackbaud/skyux-logger');

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

async function uploadAsset(containerClient, asset) {
  logger.info('Creating blob for %s', asset.name);

  const blockBlobClient = containerClient.getBlockBlobClient(asset.name);

  if (asset.content) {
    const blobContentType = getContentTypeForTextFile(asset.name);

    logger.info('Setting content type to %s for blob %s', blobContentType, asset.name);

    logger.info('Uploading file %s from contents', asset.name);

    const response = await blockBlobClient.upload(
      asset.content,
      asset.content.length,
      {
        blobHTTPHeaders: {
          blobContentType
        }
      }
    );

    logger.info('Received following response from upload(): %s', JSON.stringify(response));
  } else if (asset.file) {
    const blobContentType = mime.lookup(asset.file) || 'application/octet-stream';

    logger.info('Setting content type to %s for blob %s', blobContentType, asset.name);

    logger.info('Uploading file %s from disk', asset.name);

    const response = await blockBlobClient.uploadFile(
      asset.file,
      {
        blobHTTPHeaders: {
          blobContentType
        }
      }
    );

    logger.info('Received following response from uploadFile(): %s', JSON.stringify(response));
  } else {
    throw new Error('Unknown asset type.');
  }
}

/**
 * For each asset, register it to blob storage.
 * @name registerAssetsToBlob
 * @param {Array} assets
 * @param {Object} settings
 * @returns {Function} promise
 */
async function registerAssetsToBlob(settings, assets) {
  const containerClient = new azureBlob.ContainerClient(
    `https://${settings.azureStorageAccount}.blob.core.windows.net/${settings.name}`,
    new azureBlob.StorageSharedKeyCredential(
      settings.azureStorageAccount,
      settings.azureStorageAccessKey
    )
  );

  logger.info('Verifying container %s', settings.name);

  try {
    if (!assets) {
      throw new Error('Assets are required.');
    }

    await containerClient.createIfNotExists();

    for (let i = 0; i < assets.length; i++) {
      await uploadAsset(containerClient, assets[i]);
    }

    logger.info('SPA %s registered in blob storage.', settings.name);
  } catch (err) {
    logger.error(err);
    throw err;
  }
}

/**
 * Inserts or replaces an entity in Table Storage.
 * @name registerEntityToTable
 * @param {Object} settings
 * @param {Entity} entity
 * @returns {Function} promise
 */
async function registerEntityToTable(settings, entity) {
  const tableClient = new azureTables.TableClient(
    `https://${settings.azureStorageAccount}.table.core.windows.net`,
    settings.azureStorageTableName,
    new azureTables.StorageSharedKeyCredential(
      settings.azureStorageAccount,
      settings.azureStorageAccessKey
    )
  );

  logger.info('Verifying table %s', settings.azureStorageTableName);

  try {
    const table = await tableClient.createTable();
    await table.upsertEntity(entity, azureTables.UpdateMode.Replace);

    logger.info('SPA %s registered in table storage.', settings.name);
  } catch (err) {
    logger.error(err);
    throw err;
  }
}

module.exports = {
  registerAssetsToBlob: registerAssetsToBlob,
  registerEntityToTable: registerEntityToTable
};
