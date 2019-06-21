'use strict';

const logger = require('@blackbaud/skyux-logger');

const assets = require('./assets');
const azure = require('./azure');
const deploySpa = require('./deploy-spa');
const deployStatic = require('./deploy-static');

module.exports = (settings) => {
  return new Promise(async (resolve, reject) => {
    const assetsCombined = assets.getDistAssets(
      true,
      settings.isStaticClient,
      settings.version
    ).concat(
      assets.getEmittedAssets()
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
        resolve();
      } catch (err) {
        logger.error(err);
        reject(err);
      }
    } else {
      reject('Unable to locate any assets to deploy.');
    }
  });
};
