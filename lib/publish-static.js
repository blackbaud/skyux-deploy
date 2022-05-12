'use strict';

const azure = require('./azure');

module.exports = (settings) => {
  const entity = {
    partitionKey: settings.name,
    rowKey: '__default',
    Version: settings.version
  };

  return azure.registerEntityToTable(settings, entity);
};
