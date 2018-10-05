/*jshint jasmine: true, node: true */
'use strict';

describe('skyux-deploy lib settings', () => {

  const fs = require('fs-extra');
  const path = require('path');
  const logger = require('@blackbaud/skyux-logger');

  it('should expose a getSettings method', () => {
    expect(require('../lib/settings').getSettings).toBeDefined();
  });

  it('should return settings, merging package.json with arguments', () => {

    spyOn(fs, 'existsSync').and.returnValue(true);
    spyOn(fs, 'readJsonSync').and.callFake((filename) => {
      if (filename.indexOf('package.json') > -1) {
        return {
          version: 'custom-version',
          test1: 'value1'
        };
      }

      if (filename.indexOf('skyuxconfig.json') > -1) {
        return {
          test2: 'value2'
        };
      }

      return {};
    });

    const lib = require('../lib/settings');
    const settings = lib.getSettings({
      name: 'custom-name1'
    });

    expect(settings.name).toEqual('custom-name1');
    expect(settings.version).toEqual('custom-version');
    expect(settings.packageConfig.test1).toEqual('value1');
    expect(settings.skyuxConfig.test2).toEqual('value2');
  });

  it('should return settings even if package.json does not exist', () => {

    spyOn(logger, 'error');
    spyOn(fs, 'existsSync').and.returnValue(false);

    const lib = require('../lib/settings');
    const settings = lib.getSettings({
      name: 'custom-name2'
    });

    expect(settings.name).toEqual('custom-name2');
    expect(settings.version).toEqual('');
    expect(logger.error).toHaveBeenCalledWith(
      'Unable to locate an installation of SKYUX2.'
    );
  });

  function setupPackageJson(_requested, argv) {
    const skyuxInstalledPath = path.join(
      process.cwd(),
      'node_modules',
      '@blackbaud',
      'skyux',
      'package.json'
    );

    spyOn(logger, 'error');
    spyOn(fs, 'existsSync').and.returnValue(true);
    spyOn(fs, 'readJsonSync').and.callFake((filename) => {
      if (filename === skyuxInstalledPath) {
        return {
          _requested
        };
      }

      return {};
    });

    const lib = require('../lib/settings');
    const settings = lib.getSettings(argv);

    expect(logger.error).not.toHaveBeenCalled();
    return settings;
  }

  it('should return the default skyux version if logSkyuxVersion is set to false', () => {
    const version = 'custom-skyux-version-npm3';
    const settings = setupPackageJson(
      {
        spec: version
      },
      {
        logSkyuxVersion: false
      });
    expect(settings.skyuxVersion).toEqual('');
  });

  it('should return the default skyux version if logSkyuxVersion is set to `false`', () => {
    const version = 'custom-skyux-version-npm3';
    const settings = setupPackageJson(
      {
        spec: version
      },
      {
        logSkyuxVersion: 'false'
      });
    expect(settings.skyuxVersion).toEqual('');
  });

  it('should read the skyux version if it is installed (npm < 5)', () => {
    const version = 'custom-skyux-version-npm3';
    const settings = setupPackageJson({
      spec: version
    });

    expect(settings.skyuxVersion).toEqual(version);
  });

  it('should read the skyux version if it is installed (npm >= 5)', () => {
    const version = 'custom-skyux-version-npm5';
    const settings = setupPackageJson({
      rawSpec: version
    });

    expect(settings.skyuxVersion).toEqual(version);
  });

});
