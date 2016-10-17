/*jshint jasmine: true, node: true */
'use strict';

describe('sky-pages-deploy lib deploy', () => {

  const mock = require('mock-require');
  const logger = require('winston');

  let lib;
  let assets;
  let assetsSettings;
  let assetsResolve;
  let assetsReject;

  let entity;
  let entitySettings;
  let entityResolve;
  let entityReject;

  beforeEach(() => {
    assets = [];
    assetsSettings = {};
    assetsResolve = false;
    assetsReject = '';

    entity = {};
    entitySettings = {};
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
        entitySettings = s;
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

    lib = require('../lib/deploy');
  });

  afterEach(() => {
    mock.stop('../lib/azure');
  });

  it('should create an entity and call registerAssetsToBlob', () => {
    lib({
      name: 'custom-name1',
      version: 'custom-version1',
      skyuxVersion: 'custom-skyux-version1'
    });
    expect(assetsSettings.name).toEqual('custom-name1');
    expect(assetsSettings.version).toEqual('custom-version1');
    expect(assetsSettings.skyuxVersion).toEqual('custom-skyux-version1');
  });

  it('should handle an error after calling registerEntityToBlob', () => {
    assetsReject = 'custom-error1';
    lib({}).then(() => {
      expect(logger.error).toHaveBeenCalledWith('custom-error1');
    });
  });

  it('should call registerEntityToTable if registerAssetsToBlob is successful', () => {
    assetsResolve = true;
    lib({
      name: 'custom-name2',
      version: 'custom-version2',
      skyuxVersion: 'custom-skyux-version2'
    }).then(() => {
      expect(entity.PartitionKey).toEqual('custom-name2');
      expect(entity.RowKey).toEqual('custom-version2');
      expect(entity.SkyUXVersion).toEqual('custom-skyux-version2');
    });

  });

  it('should handle an error after calling registerEntityToTable', () => {
    entityReject = 'custom-error2';
    lib({}).then(() => {
      expect(logger.error).toHaveBeenCalledWith('custom-error2');
    });
  });

  it('should display a message if registerEntityToTable is successful', () => {
    entityResolve = true;
    lib({}).then(() => {
      expect(logger.info).toHaveBeenCalledWith('Successfully registered.');
    });
  });

});
