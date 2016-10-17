/*jshint jasmine: true, node: true */
'use strict';

const logger = require('winston');
const mock = require('mock-require');

describe('sky-pages-deploy', () => {

  const cmds = {
    deploy: false,
    publish: false
  };

  beforeAll(() => {
    Object.keys(cmds).forEach(key => {
      mock('../lib/' + key, () => {
        cmds[key] = true;
      });
    });
  });

  afterAll(() => {
    Object.keys(cmds).forEach(key => mock.stop('../lib/' + key));
  });

  it('should give details name, version, and SKY UX version', () => {
    spyOn(logger, 'info');
    require('../index')({
      _: ['junk-command'],
      name: 'spa-name',
      version: 'spa-version',
      skyuxVersion: 'skyux-version'
    });
    expect(logger.info).toHaveBeenCalledWith('SPA Name: %s', 'spa-name');
    expect(logger.info).toHaveBeenCalledWith('SPA Version: %s', 'spa-version');
    expect(logger.info).toHaveBeenCalledWith('SKY UX Version: %s', 'skyux-version');
    expect(logger.info).toHaveBeenCalledWith('Unknown sky-pages-deploy command.');
  });

  it('should handle known commands', () => {
    Object.keys(cmds).forEach(key => {
      require('../index')({
        _: [key]
      });
      expect(cmds[key]).toEqual(true);
    });
  });

});
