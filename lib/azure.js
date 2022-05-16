'use strict';

const azureBlob = require('@azure/storage-blob');
const azureTables = require('@azure/data-tables');
const mime = require('mime-types');
const logger = require('@blackbaud/skyux-logger');
const compression = require('./compression');

function createOptions(blobContentType, compressedVersions) {
  const options = {
    blobHTTPHeaders: {
      blobContentType
    }
  };

 if (compressedVersions) {
    options.metadata = {
      brotli: '1',
      gzip: '1'
    };
  }

  return options;
}

async function uploadAsset(containerClient, asset) {
  logger.info('Creating blob for %s', asset.name);

  const blockBlobClient = containerClient.getBlockBlobClient(asset.name);
  const blobContentType = mime.lookup(asset.name) || 'application/octet-stream';
  let compressedVersions;
  let uploadPromise;
  let logCb;

  if (asset.content) {
    if (compression.canBeCompressed(blobContentType)) {
      compressedVersions = await compression.compress(asset.content);
    }

    logCb = () => {
      logger.info('Setting content type to %s for blob %s', blobContentType, asset.name);
      logger.info('Uploading file %s from contents', asset.name);
    };

    uploadPromise = blockBlobClient.upload(
      asset.content,
      asset.content.length,
      createOptions(blobContentType, compressedVersions)
    );
  } else if (asset.file) {
    if (compression.canBeCompressed(blobContentType)) {
      compressedVersions = await compression.compressFile(asset.file);
    }

    logCb = () => {
      logger.info('Setting content type to %s for blob %s', blobContentType, asset.name);
      logger.info('Uploading file %s from disk', asset.name);
    };

    uploadPromise = blockBlobClient.uploadFile(
      asset.file,
      createOptions(blobContentType, compressedVersions)
    );
  } else {
    throw new Error('Unknown asset type.');
  }

  if (compressedVersions) {
    logger.info('Uploading compressed versions for %s', asset.name);

    await uploadAsset(
      containerClient,
      {
        content: compressedVersions.brotli,
        name: asset.name + '.br',
      }
    );

    await uploadAsset(
      containerClient,
      {
        content: compressedVersions.gzip,
        name: asset.name + '.gz',
      }
    );
  }

  logCb();
  await uploadPromise;
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
