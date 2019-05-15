'use strict';

const logger = require('@blackbaud/skyux-logger');

const assets = require('./assets');
const azure = require('./azure');
const portal = require('./portal');

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

  const spa = {
    name: settings.name,
    package_config: settings.packageConfig,
    scripts: assetsWithoutContent,
    sky_ux_config: settings.skyuxConfig
  };

  return new Promise(async (resolve, reject) => {
    if (assetsCombined.length) {
      try {
        await azure.registerAssetsToBlob(settings, assetsCombined);
        await portal.deploySpa(settings.azureStorageAccessKey, spa, settings.version);

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
