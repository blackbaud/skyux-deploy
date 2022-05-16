'use strict';

const azure = require('./azure');

module.exports = async (settings) => {
  const entity = {
    partitionKey: settings.name,
    rowKey: '__default',
    Version: settings.version,
  };

  return azure.registerEntityToTable(settings, entity);
};
