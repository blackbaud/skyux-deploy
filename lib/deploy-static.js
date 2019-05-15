/*jshint node: true*/
'use strict';

const azure = require('./azure');

async function deploy(settings, assetsWithoutContent) {
  const entity = {
    PartitionKey: azure.generator.String(settings.name),
    RowKey: azure.generator.String(settings.version),
    Scripts: azure.generator.String(JSON.stringify(assetsWithoutContent)),
    PackageConfig: azure.generator.String(JSON.stringify(settings.packageConfig)),
    SkyUXConfig: azure.generator.String(JSON.stringify(settings.skyuxConfig))
  };

  return await azure.registerEntityToTable(settings, entity);
}

module.exports = deploy;
