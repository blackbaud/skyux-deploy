'use strict';

const logger = require('@blackbaud/skyux-logger');

const assets = require('./assets');
const azure = require('./azure');
const deploySpa = require('./deploy-spa');
const deployStatic = require('./deploy-static');

module.exports = (settings) => {
  const assetsWithContent = assets.getDistAssets(
    true,
    settings.isStaticClient,
    settings.version
  );
  const assetsWithoutContent = assets.getDistAssets(
    false,
    settings.isStaticClient,
    settings.version
  );
  const assetsEmitted = assets.getEmittedAssets();
  const assetsCombined = assetsWithContent.concat(assetsEmitted);

  return new Promise(async (resolve, reject) => {
    if (assetsCombined.length) {
      try {
        await azure.registerAssetsToBlob(settings, assetsCombined);

        if (settings.isStaticClient) {
          await deployStatic(settings, assetsWithoutContent);
        } else {
          await deploySpa(settings, assetsWithoutContent);
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
