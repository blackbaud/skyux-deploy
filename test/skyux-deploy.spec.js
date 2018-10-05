/*jshint jasmine: true, node: true */
'use strict';

const logger = require('@blackbaud/skyux-logger');
const mock = require('mock-require');

describe('skyux-deploy', () => {

  const cmds = {
    deploy: false,
    publish: false
  };

  beforeAll(() => {
    Object.keys(cmds).forEach(key => {
      mock('../lib/' + key, () => {
        cmds[key] = true;
        return Promise.reject();
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
    expect(logger.info).toHaveBeenCalledWith('Unknown skyux-deploy command.');
  });

  it('should handle known commands', (done) => {
    let commandsChecked = 0;
    let totalCommands = Object.keys(cmds).length;

    spyOn(process, 'exit').and.callFake(() => {
      commandsChecked++;
      if (commandsChecked >= totalCommands) {
        done();
      }
    });

    Object.keys(cmds).forEach(key => {
      require('../index')({
        _: [key]
      });

      expect(cmds[key]).toEqual(true);
    });
  });

  it('should return a non-zero exit code if a known command fails', (done) => {

    spyOn(process, 'exit').and.callFake(exitCode => {
      expect(exitCode).toEqual(1);
      done();
    });

    require('../index')({
      _: ['deploy'],
      name: 'spa-name',
      version: 'spa-version',
      skyuxVersion: 'skyux-version'
    });

  });

});
