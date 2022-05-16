/*jshint node: true*/
'use strict';

const logger = require('@blackbaud/skyux-logger');
const assets = require('./assets');
const azure = require('./azure');
const utils = require('./utils');

async function register(settings, versionAssets, versionRowKey) {
  const assetsWithoutContent = assets.getDistAssets(
    false,
    settings.isStaticClient,
    versionAssets
  );

  const scripts = assetsWithoutContent.filter((x) => x.type === 'script');
  const stylesheets = assetsWithoutContent.filter(
    (x) => x.type === 'stylesheet'
  );

  const entity = {
    partitionKey: settings.name,
    rowKey: versionRowKey,
    Scripts: JSON.stringify(scripts),
    PackageConfig: JSON.stringify(settings.packageConfig),
    SkyUXConfig: JSON.stringify(settings.skyuxConfig),
  };

  if (stylesheets.length) {
    entity.Stylesheets = JSON.stringify(stylesheets);
  }

  logger.info(`Registering ${versionAssets} as ${versionRowKey}.`);
  return await azure.registerEntityToTable(settings, entity);
}

async function deploy(settings) {
  // Register exact version
  await register(settings, settings.version, settings.version);

  const versionMajor = utils.getValidMajorVersion(settings.version);

  // Only update major version pointers if it's a valid version and not a pre-release.
  if (versionMajor) {
    await register(settings, versionMajor, versionMajor);
    await register(settings, settings.version, `${versionMajor}-latest`);
  } else {
    logger.info(
      'Not updating latest major release as version in package.json is invalid or is a pre-release.'
    );
  }
}

module.exports = deploy;
