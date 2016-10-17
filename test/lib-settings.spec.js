/*jshint jasmine: true, node: true */
'use strict';

describe('sky-pages-deploy lib settings', () => {

  const fs = require('fs');
  const path = require('path');
  const proxyquire = require('proxyquire');
  const logger = require('winston');

  it('should expose a getSettings method', () => {
    expect(require('../lib/settings').getSettings).toBeDefined();
  });

  it('should return settings, merging package.json with arguments', () => {

    let stubs = {};
    stubs[path.join(process.cwd(), 'package.json')] = {
      '@noCallThru': true,
      version: 'custom-version'
    };

    const lib = proxyquire('../lib/settings', stubs);
    const settings = lib.getSettings({
      name: 'custom-name1'
    });

    expect(settings.name).toEqual('custom-name1');
    expect(settings.version).toEqual('custom-version');
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

  it('should read the skyux version if it is installed', () => {
    spyOn(logger, 'error');
    spyOn(fs, 'existsSync').and.returnValue(true);

    let stubs = {};
    const skyuxPath = path.join(
      process.cwd(),
      'node_modules',
      'blackbaud-skyux2',
      'package.json'
    );

    stubs[skyuxPath] = {
      '@noCallThru': true,
      _requested: {
        spec: 'custom-skyux-version'
      }
    };

    const lib = proxyquire('../lib/settings', stubs);
    const settings = lib.getSettings();

    expect(settings.skyuxVersion).toEqual('custom-skyux-version');
    expect(logger.error).not.toHaveBeenCalled();
  });

});
