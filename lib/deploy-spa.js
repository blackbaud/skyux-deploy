'use strict';

const assets = require('./assets');
const portal = require('./portal');

async function deploy(settings) {
  const assetsWithoutContent = assets.getDistAssets(
    false,
    settings.isStaticClient,
    settings.version,
    settings.hashFileNames
  );

  const scripts = assetsWithoutContent.filter(x => x.type === 'script');
  const styleSheets = assetsWithoutContent.filter(x => x.type === 'styleSheet');

  const spa = {
    name: settings.name,
    package_config: settings.packageConfig,
    scripts,
    sky_ux_config: settings.skyuxConfig
  };

  if (styleSheets.length) {
    spa.styleSheets = styleSheets;
  }

  if (settings.rootElementTagName) {
    spa.root_element_tag_name = settings.rootElementTagName;
  }

  return await portal.deploySpa(settings.azureStorageAccessKey, spa, settings.version);
}

module.exports = deploy;
