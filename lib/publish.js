'use strict';

const publishSpa = require('./publish-spa');
const publishStatic = require('./publish-static');

module.exports = (settings) => {
  if (settings.isStaticClient) {
    return publishStatic(settings);
  }

  return publishSpa(settings);
};
