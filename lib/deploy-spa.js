'use strict';

const assets = require('./assets');
const portal = require('./portal');

async function deploy(settings) {
  const assetsWithoutContent = assets.getDistAssets(
    false,
    settings.isStaticClient,
    settings.version
  );

  const spa = {
    name: settings.name,
    package_config: settings.packageConfig,
    scripts: assetsWithoutContent,
    sky_ux_config: settings.skyuxConfig
  };

  return await portal.deploySpa(settings.azureStorageAccessKey, spa, settings.version);
}

module.exports = deploy;
