/*jshint jasmine: true, node: true */
'use strict';

describe('sky-pages-deploy lib assets', () => {

  const fs = require('fs');
  const path = require('path');
  const proxyquire = require('proxyquire').noCallThru();
  // const logger = require('winston');

  it('should expose a getDistAssets method', () => {
    const lib = require('../lib/assets');
    expect(lib.getDistAssets).toBeDefined();
  });

  it('should expose a getHash method', () => {
    const lib = require('../lib/assets');
    expect(lib.getHash).toBeDefined();
  });

  describe('getDistAssets', () => {

    it('should handle if metadata.json file exists', () => {
      const lib = require('../lib/assets');
      expect(lib.getDistAssets()).toBeUndefined();
    });

    it('should return the name and sri hash for each assets in metadata', () => {
      const readFileSync = fs.readFileSync;
      spyOn(fs, 'existsSync').and.returnValue(true);
      spyOn(fs, 'readFileSync').and.callFake((file, options) => {
        if (file.indexOf('custom-name.js') > -1) {
          return 'my-custom-content1';
        } else {
          return readFileSync(file, options);
        }
      });

      let stubs = {};
      stubs[path.join(process.cwd(), 'dist', 'metadata.json')] = [
        {
          name: 'custom-name.js'
        }
      ];

      const lib = proxyquire('../lib/assets', stubs);
      const assets = lib.getDistAssets();
      const sri = lib.getHash('my-custom-content1', 'sha384', 'base64');

      expect(assets[0].name).toContain('custom-name');
      expect(assets[0].sri).toEqual('sha384-' + sri);
    });

    it('should include content if argument supplied', () => {
      const readFileSync = fs.readFileSync;
      spyOn(fs, 'existsSync').and.returnValue(true);
      spyOn(fs, 'readFileSync').and.callFake((file, options) => {
        if (file.indexOf('custom-name.js') > -1) {
          return 'my-custom-content2';
        } else {
          return readFileSync(file, options);
        }
      });

      let stubs = {};
      stubs[path.join(process.cwd(), 'dist', 'metadata.json')] = [
        {
          name: 'custom-name.js'
        }
      ];

      const lib = proxyquire('../lib/assets', stubs);
      const assets = lib.getDistAssets(true);

      expect(assets[0].content).toEqual('my-custom-content2');
    });

  });

});
