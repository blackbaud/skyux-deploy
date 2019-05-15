'use strict';

const logger = require('@blackbaud/skyux-logger');
const deploy = require('./lib/deploy');
const publish = require('./lib/publish');
const settings = require('./lib/settings');

function exit() {
  process.exit(1);
}

/**
 * Verifies version + assets, then adds to blob + table storage.
 * @name processArgs
 * @param {Object} argv
 * @returns null
 */
function processArgv(argv) {
  const options = settings.getSettings(argv);

  logger.info('SPA Name: %s', options.name);
  logger.info('SPA Version: %s', options.version);

  switch (argv._[0]) {
    case 'deploy':
      deploy(options).catch(exit);
      break;
    case 'publish':
      publish(options).catch(exit);
      break;
    default:
      logger.info('Unknown skyux-deploy command.');
      break;
  }
}

module.exports = processArgv;
