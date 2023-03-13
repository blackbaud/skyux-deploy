'use strict';

const logger = require('@blackbaud/skyux-logger');

const assets = require('./assets');
const azure = require('./azure');
const deploySpa = require('./deploy-spa');
const deployStatic = require('./deploy-static');

module.exports = async (settings) => {
  const assetsCombined = assets
    .getDistAssets(
      true,
      settings.isStaticClient,
      settings.version,
      settings.hashFileNames
    )
    .concat(
      assets.getEmittedAssets(
        settings.isStaticClient,
        settings.version,
        settings.assetsGlob
      )
    );

  if (assetsCombined.length) {
    try {
      await azure.registerAssetsToBlob(settings, assetsCombined);

      if (settings.isStaticClient) {
        await deployStatic(settings);
      } else {
        await deploySpa(settings);
      }

      logger.info('Successfully registered.');
    } catch (err) {
      logger.error(err);
      throw err;
    }
  } else {
    logger.error('Unable to locate any assets to deploy.');
    throw new Error('Unable to locate any assets to deploy.');
  }
};
