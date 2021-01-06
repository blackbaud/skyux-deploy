'use strict';

describe('skyux-deploy lib settings', () => {

  const fs = require('fs-extra');
  const logger = require('@blackbaud/skyux-logger');

  it('should expose a getSettings method', () => {
    expect(require('../lib/settings').getSettings).toBeDefined();
  });

  function testGetSettings(name, argv) {
    spyOn(fs, 'existsSync').and.returnValue(true);
    spyOn(fs, 'readJsonSync').and.callFake((filename) => {
      if (filename.indexOf('package.json') > -1) {
        return {
          name: 'default-name',
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
    const settings = lib.getSettings(argv);

    expect(settings.name).toEqual(name);
    expect(settings.version).toEqual('custom-version');
    expect(settings.packageConfig.test1).toEqual('value1');
    expect(settings.skyuxConfig.test2).toEqual('value2');
  }

  it('should return settings, merging package.json with arguments', () => {
    testGetSettings('custom-name1', {
      name: 'custom-name1'
    });
  });

  it('should return settings, merging package.json without arguments', () => {
    testGetSettings('default-name');
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
  });

  it('should support disabling hashed file names', () => {
    const lib = require('../lib/settings');
    const settings = lib.getSettings({
      name: 'foobar',
      hashFileNames: false
    });

    expect(settings.hashFileNames).toEqual(false);
  });

  it('should support setting the root element tag name', () => {
    const lib = require('../lib/settings');
    const settings = lib.getSettings({
      name: 'foobar',
      rootElementTagName: 'app-root'
    });

    expect(settings.rootElementTagName).toEqual('app-root');
  });
});
