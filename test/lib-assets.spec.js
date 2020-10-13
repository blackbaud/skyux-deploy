'use strict';

describe('skyux-deploy lib assets', () => {

  const crypto = require('crypto');
  const fs = require('fs-extra');
  const path = require('path');
  const glob = require('glob');
  const proxyquire = require('proxyquire').noCallThru();

  beforeEach(() => {
    spyOn(fs, 'statSync').and.returnValue({
      size: 0
    });

    spyOn(crypto, 'createHash').and.callFake(() => ({
      update: () => ({
        digest: () => 'MOCK_HASH'
      })
    }));
  });

  it('should expose a getDistAssets method', () => {
    const lib = require('../lib/assets');
    expect(lib.getDistAssets).toBeDefined();
  });

  it('should expose a getEmittedAssets method', () => {
    const lib = require('../lib/assets');
    expect(lib.getEmittedAssets).toBeDefined();
  });

  it('should expose a getHash method', () => {
    const lib = require('../lib/assets');
    expect(lib.getHash).toBeDefined();
  });

  describe('getDistAssets', () => {

    it('should return an empty array if no metadata.json', () => {
      const lib = require('../lib/assets');
      expect(lib.getDistAssets()).toEqual([]);
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

      expect(assets[0].name).toEqual('custom-name.MOCK_HASH.js');
      expect(assets[0].sri).toEqual('sha384-' + sri);
      expect(assets[0].size).toEqual(0);
      expect(fs.statSync).toHaveBeenCalled();
    });

    it('should allow disabling the file name hash', () => {
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
      const hashFileNames = false;
      const assets = lib.getDistAssets(false, false, undefined, hashFileNames);

      expect(assets[0].name).toEqual('custom-name.js');
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

    it('should not include content if argument supplied', () => {
      const readFileSync = fs.readFileSync;
      spyOn(fs, 'existsSync').and.returnValue(true);
      spyOn(fs, 'readFileSync').and.callFake((file, options) => {

        if (file.indexOf('custom-name.js') > -1) {
          return 'my-custom-content3';
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
      const assetsWithContent = lib.getDistAssets(true);
      const assetsWithoutContent = lib.getDistAssets(false);

      expect(assetsWithContent[0].content).toEqual('my-custom-content3');
      expect(assetsWithoutContent[0].content).not.toBeDefined();
    });

    it('should evaluate static client assets', () => {
      const readFileSync = fs.readFileSync;

      spyOn(glob, 'sync').and.returnValue([
        path.join(process.cwd(), 'dist', 'bundles', 'test.umd.js')
      ]);
      spyOn(fs, 'readFileSync').and.callFake((file, options) => {
        if (file.indexOf('test.umd.js') > -1) {
          return 'my-custom-content3';
        } else {
          return readFileSync(file, options);
        }
      });

      let stubs = {};
      stubs[path.join(process.cwd(), 'dist', 'bundles', 'test.umd.js')] = [
        {
          name: 'custom-name.js'
        }
      ];

      const lib = proxyquire('../lib/assets', stubs);

      const assetsWithContent = lib.getDistAssets(true, true);

      expect(assetsWithContent[0].content).toEqual('my-custom-content3');
    });

    it('should handle major version assets', () => {
      const readFileSync = fs.readFileSync;

      spyOn(glob, 'sync').and.returnValue([
        path.join(process.cwd(), 'dist', 'bundles', 'test.umd.js')
      ]);
      spyOn(fs, 'readFileSync').and.callFake((file, options) => {
        if (file.indexOf('test.umd.js') > -1) {
          return 'my-custom-content3';
        } else {
          return readFileSync(file, options);
        }
      });

      let stubs = {};
      stubs[path.join(process.cwd(), 'dist', 'bundles', 'test.umd.js')] = [
        {
          name: 'custom-name.js'
        }
      ];

      const lib = proxyquire('../lib/assets', stubs);
      const assetsWithContent = lib.getDistAssets(true, true, '1.0.0');
      expect(assetsWithContent[0].version).toEqual('1.0.0');
      expect(assetsWithContent[1].version).toEqual('1');
    });
  });

  describe('getEmittedAssets', () => {

    it('should return an empty array if no assets folder', () => {
      const lib = require('../lib/assets');
      expect(lib.getEmittedAssets()).toEqual([]);
    });

    it('should return an empty array if empty assets folder', () => {
      spyOn(fs, 'existsSync').and.returnValue(true);
      spyOn(fs, 'readdirSync').and.returnValue([]);
      const lib = require('../lib/assets');
      expect(lib.getEmittedAssets()).toEqual([]);
    });

    it('should return an array of names/files from the assets folder', () => {
      spyOn(glob, 'sync').and.returnValue([
        path.join(process.cwd(), 'dist', 'assets', 'nested', 'my-file.jpg')
      ]);
      const lib = require('../lib/assets');
      expect(lib.getEmittedAssets()).toEqual([
        {
          name: path.join('assets', 'nested', 'my-file.jpg'),
          file: path.join(process.cwd(), 'dist', 'assets', 'nested', 'my-file.jpg')
        }
      ]);
    });

    it('should include version assets if static client', () => {
      spyOn(glob, 'sync').and.returnValue([
        path.join(process.cwd(), 'dist', 'assets', 'nested', 'my-file.jpg')
      ]);
      const lib = require('../lib/assets');
      expect(lib.getEmittedAssets(true, '1.2.3-rc.0')).toEqual([
        {
          name: path.join('1.2.3-rc.0', 'assets', 'nested', 'my-file.jpg'),
          file: path.join(process.cwd(), 'dist', 'assets', 'nested', 'my-file.jpg')
        }
      ]);
    });

    it('should include version and major version assets if static client', () => {
      spyOn(glob, 'sync').and.returnValue([
        path.join(process.cwd(), 'dist', 'assets', 'nested', 'my-file.jpg')
      ]);
      const lib = require('../lib/assets');
      expect(lib.getEmittedAssets(true, '1.2.3')).toEqual([
        {
          name: path.join('1.2.3', 'assets', 'nested', 'my-file.jpg'),
          file: path.join(process.cwd(), 'dist', 'assets', 'nested', 'my-file.jpg')
        },
        {
          name: path.join('1', 'assets', 'nested', 'my-file.jpg'),
          file: path.join(process.cwd(), 'dist', 'assets', 'nested', 'my-file.jpg')
        }
      ]);
    });

    it('should exclude directories', () => {
      spyOn(glob, 'sync').and.returnValue([]);

      const assets = path.join(process.cwd(), 'dist', 'assets');
      const lib = require('../lib/assets');

      lib.getEmittedAssets();
      expect(glob.sync).toHaveBeenCalledWith(
        path.join(assets, '**', '*.*'),
        { nodir: true }
      )
    });
  });

});
