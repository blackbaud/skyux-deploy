'use strict';

const logger = require('@blackbaud/skyux-logger');

const publishSpa = require('./publish-spa');
const publishStatic = require('./publish-static');

module.exports = async (settings) => {
  try {
    if (settings.isStaticClient) {
      await publishStatic(settings);
    } else {
      await publishSpa(settings);
    }

    logger.info('Successfully published.');
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
