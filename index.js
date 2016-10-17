/*jshint node: true*/
'use strict';

const logger = require('winston');
const deploy = require('./lib/deploy');
const publish = require('./lib/publish');
const settings = require('./lib/settings');

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
  logger.info('SKY UX Version: %s', options.skyuxVersion);

  switch (argv._[0]) {
    case 'deploy':
      deploy(options);
      break;
    case 'publish':
      publish(options);
      break;
    default:
      logger.info('Unknown sky-pages-deploy command.');
      break;
  }
}

module.exports = processArgv;
