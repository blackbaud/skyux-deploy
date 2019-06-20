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

          // Duplicate row, but with row-key of `majorVersion-latest`.
          // This is used for Auth-Client access on Host.
          if (settings.version && settings.version.indexOf('.') > -1) {
            const latestVersion = settings.version.split('.')[0] + '-latest';
            const latestSettings = Object.assign({}, settings, { version: latestVersion });
            await deployStatic(latestSettings, assetsWithoutContent);
          }

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
