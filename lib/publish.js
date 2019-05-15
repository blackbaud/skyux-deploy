'use strict';

const portal = require('./portal');

module.exports = (settings) => {
  const spa = {
    name: settings.name,
    version: settings.version
  };

  return portal.publishSpa(settings.azureStorageAccessKey, spa);
};
