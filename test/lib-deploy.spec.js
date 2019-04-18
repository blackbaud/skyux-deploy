/*jshint jasmine: true, node: true */
'use strict';

describe('skyux-deploy lib deploy', () => {

  const mock = require('mock-require');
  const logger = require('@blackbaud/skyux-logger');

  const distAsset = {
    name: 'my-asset.js',
    content: 'my-content'
  };

  const emittedAsset = {
    name: 'my-image.png',
    file: 'full-path/my-image.png'
  };

  let lib;
  let assets;
  let assetsSettings;
  let assetsResolve;
  let assetsReject;

  let entity;
  let entityResolve;
  let entityReject;

  beforeEach(() => {
    assets = [];
    assetsSettings = {};
    assetsResolve = false;
    assetsReject = '';

    entity = {};
    entityResolve = false;
    entityReject = '';

    spyOn(logger, 'error');
    spyOn(logger, 'info');

    mock('../lib/azure', {
      generator: {
        String: s => s
      },
      registerAssetsToBlob: (s, a) => {
        assetsSettings = s;
        assets = a;
        return new Promise((resolve, reject) => {
          if (assetsResolve) {
            resolve();
          }

          if (assetsReject !== '') {
            reject(assetsReject);
          }
        });
      },

      registerEntityToTable: (s, e) => {
        entity = e;
        return new Promise((resolve, reject) => {
          if (entityResolve) {
            resolve();
          }

          if (entityReject !== '') {
            reject(entityReject);
          }
        });
      }
    });

    mock('../lib/assets', {
      getDistAssets: () => ([distAsset]),
      getEmittedAssets: () => ([emittedAsset])
    });

    lib = require('../lib/deploy');
  });

  afterEach(() => {
    mock.stop('../lib/azure');
    mock.stop('../lib/assets');
  });

  it('should create an entity and call registerAssetsToBlob', () => {
    lib({
      name: 'custom-name1',
      version: 'custom-version1'
    });
    expect(assetsSettings.name).toEqual('custom-name1');
    expect(assetsSettings.version).toEqual('custom-version1');
  });

  it('should handle an error after calling registerEntityToBlob', (done) => {
    assetsReject = 'custom-error1';
    lib({}).catch((err) => {
      expect(logger.error).toHaveBeenCalledWith(assetsReject);
      expect(err).toEqual(assetsReject);
      done();
    });
  });

  it('should call registerEntityToTable if registerAssetsToBlob is successful', (done) => {
    assetsResolve = true;
    entityResolve = true;
    lib({
      name: 'custom-name2',
      version: 'custom-version2',
      skyuxConfig: { test1: true },
      packageConfig: { test2: true }
    }).then(() => {
      expect(entity.PartitionKey).toEqual('custom-name2');
      expect(entity.RowKey).toEqual('custom-version2');
      expect(entity.SkyUXConfig).toEqual(JSON.stringify({ test1: true }));
      expect(entity.PackageConfig).toEqual(JSON.stringify({ test2: true }));
      done();
    });

  });

  it('should handle an error after calling registerEntityToTable', (done) => {
    assetsResolve = true;
    entityReject = 'custom-error2';
    lib({}).catch((err) => {
      expect(logger.error).toHaveBeenCalledWith(entityReject);
      expect(err).toEqual(entityReject);
      done();
    });
  });

  it('should display a message if registerEntityToTable is successful', (done) => {
    assetsResolve = true;
    entityResolve = true;
    lib({}).then(() => {
      expect(logger.info).toHaveBeenCalledWith('Successfully registered.');
      done();
    });
  });

  it('should concat the assets from getDistAssets and getEmittedAssets', (done) => {
    assetsResolve = true;
    entityResolve = true;
    lib({}).then(() => {
      expect(assets).toEqual([
        distAsset,
        emittedAsset
      ]);
      done();
    });
  });

  it('should reject if there are no assets found', (done) => {
    mock('../lib/assets', {
      getDistAssets: () => ([]),
      getEmittedAssets: () => ([])
    });

    lib = mock.reRequire('../lib/deploy');

    lib({}).catch(err => {
      expect(err).toBe('Unable to locate any assets to deploy.');
      done();
    });
  });

});
