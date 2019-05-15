'use strict';

const portal = require('./portal');

async function deploy(settings, assetsWithoutContent) {
  const spa = {
    name: settings.name,
    package_config: settings.packageConfig,
    scripts: assetsWithoutContent,
    sky_ux_config: settings.skyuxConfig
  };

  return await portal.deploySpa(settings.azureStorageAccessKey, spa, settings.version);
}

module.exports = deploy;
