'use strict';

const logger = require('@blackbaud/skyux-logger');

const publishSpa = require('./publish-spa');
const publishStatic = require('./publish-static');

module.exports = async (settings) => {
  return new Promise(async (resolve, reject) => {
      try {
        if (settings.isStaticClient) {
          await publishStatic(settings);
        } else {
          await publishSpa(settings);
        }

        logger.info('Successfully published.');
        resolve();
      } catch (err) {
        logger.error(err);
        reject(err);
      }
  });
};
