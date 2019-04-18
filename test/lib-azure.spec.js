/*jshint jasmine: true, node: true */
'use strict';

describe('skyux-deploy lib azure', () => {

  const mock = require('mock-require');
  // const azure = require('azure-storage');
  // const utils = require('../lib/utils');
  const logger = require('@blackbaud/skyux-logger');

  let lib;
  let createTableServiceArgs;
  let createBlockBlobFromTextArgs;
  let createBlockBlobFromLocalFileArgs;
  let createContainerIfNotExistsArgs;
  let createTableIfNotExistsArgs;
  let insertOrReplaceEntityArgs;

  beforeEach(() => {

    createTableServiceArgs = {};
    createBlockBlobFromTextArgs = {};
    createBlockBlobFromLocalFileArgs = {};
    createContainerIfNotExistsArgs = {};
    createTableIfNotExistsArgs = {};
    insertOrReplaceEntityArgs = {};

    mock('azure-storage', {
      createBlobService: () => {

        return {
          createContainerIfNotExists: (blobName, acl, cb) => {
            createContainerIfNotExistsArgs = {
              blobName: blobName,
              acl: acl,
              cb: cb
            };
          },

          createBlockBlobFromText: (blobName, assetName, assetContent, options, cb) => {
            createBlockBlobFromTextArgs = {
              blobName: blobName,
              assetName: assetName,
              assetContent: assetContent,
              options: options,
              cb: cb
            };
          },

          createBlockBlobFromLocalFile: (blobName, assetName, localFile, cb) => {
            createBlockBlobFromLocalFileArgs = {
              blobName: blobName,
              assetName: assetName,
              localFile: localFile,
              cb: cb
            };
          }
        };
      },

      createTableService: (account, key) => {
        createTableServiceArgs = {
          account: account,
          key: key
        };

        return {
          createTableIfNotExists: (tableName, cb) => {
            createTableIfNotExistsArgs = {
              tableName: tableName,
              cb: cb
            };
          },

          insertOrReplaceEntity: (tableName, entity, cb) => {
            insertOrReplaceEntityArgs = {
              tableName: tableName,
              entity: entity,
              cb: cb
            };
          }
        };
      },

      TableUtilities: {
        entityGenerator: {
          String: () => {}
        }
      }
    });

    lib = require('../lib/azure');
  });

  afterEach(() => {
    mock.stop('azure-storage');
  });

  it('should expose the azure TableUtilities generator', () => {
    expect(lib.generator).toBeDefined();
  });

  it('should expose a registerAssetsToBlob method', () => {
    expect(lib.registerAssetsToBlob).toBeDefined();
  });

  it('should expose a registerEntityToTable metho', () => {
    expect(lib.registerEntityToTable).toBeDefined();
  });

  describe('registerAssetsToBlob', () => {

    it('should call createContainerIfNotExist and handle error', (done) => {
      spyOn(logger, 'error');

      const error = 'error1';
      const settings = { blobName: 'blob-name1' };

      lib.registerAssetsToBlob(settings, [])
        .catch(err => {
          expect(err).toBe(error);
          expect(logger.error).toHaveBeenCalledWith(error);
          done();
        });

      createContainerIfNotExistsArgs.cb(error);
    });

    it('should call createContainerIfNotExist and handle success', () => {
      spyOn(logger, 'info');

      const settings = { blobName: 'blob-name2' };
      const assets = [{
        name: 'asset-name1',
        content: 'asset-content1'
      }];
      lib.registerAssetsToBlob(settings, assets);
      createContainerIfNotExistsArgs.cb();

      expect(logger.info).toHaveBeenCalled();
      expect(createBlockBlobFromTextArgs.blobName).toEqual(settings.name);
      expect(createBlockBlobFromTextArgs.assetName).toEqual(assets[0].name);
      expect(createBlockBlobFromTextArgs.assetContent).toEqual(assets[0].content);
      expect(createBlockBlobFromTextArgs.options.contentSettings.contentType).toEqual(
        'application/x-javascript'
      );

    });

    it('should call createBlockBlobFromText and handle error', (done) => {

      const error = 'error2';
      const settings = { blobName: 'blob-name2' };
      const assets = [{
        name: 'asset-name1',
        content: 'asset-content1'
      }];

      spyOn(logger, 'error');
      lib.registerAssetsToBlob(settings, assets)
        .catch(err => {
          expect(err).toBe(error);
          expect(logger.error).toHaveBeenCalledWith(error);
          done();
        });

      createContainerIfNotExistsArgs.cb();
      createBlockBlobFromTextArgs.cb(error);
    });

    it('should call createBlockBlobFromLocalFile and handle success', () => {
      const settings = { blobName: 'blob-name3' };
      const assets = [{
        name: 'asset-name2.jpg',
        file: '/home/assets/asset-name2.jpg'
      }];

      spyOn(logger, 'error');
      lib.registerAssetsToBlob(settings, assets);
      createContainerIfNotExistsArgs.cb();

      expect(createBlockBlobFromLocalFileArgs.blobName).toEqual(settings.name);
      expect(createBlockBlobFromLocalFileArgs.assetName).toEqual(assets[0].name);
      expect(createBlockBlobFromLocalFileArgs.localFile).toEqual(assets[0].file);
    });

    it('should call createBlockBlobFromLocalFile and handle error', (done) => {

      const error = 'error4';
      const settings = { blobName: 'blob-name4' };
      const assets = [{
        name: 'asset-name3.jpg',
        file: '/home/assets/asset-name3.jpg'
      }];

      spyOn(logger, 'error');
      lib.registerAssetsToBlob(settings, assets)
        .catch(err => {
          expect(err).toBe(error);
          expect(logger.error).toHaveBeenCalledWith(error);
          done();
        });
      createContainerIfNotExistsArgs.cb();
      createBlockBlobFromLocalFileArgs.cb(error);

    });

    it('should throw an error if no assets', (done) => {
      spyOn(logger, 'error');
      lib.registerAssetsToBlob({}).catch((err) => {
        expect(err).toEqual('Assets are required.');
        done();
      });
    });

    it('should log an error if there was unknown asset type', (done) => {
      spyOn(logger, 'error');
      const error = 'Unknown asset type.';
      lib.registerAssetsToBlob({}, [{ type: 'unknown' }])
        .catch(err => {
          expect(err).toBe(error);
          expect(logger.error).toHaveBeenCalledWith(error);
          done();
        });
      createContainerIfNotExistsArgs.cb();
    });
  });

  describe('registerEntityToTable', () => {

    it('should create a table service using the supplied credentials', () => {
      const settings = {
        azureStorageAccount: 'account2',
        azureStorageAccessKey: 'key2'
      };
      lib.registerEntityToTable(settings);
      expect(createTableServiceArgs.account).toEqual(settings.azureStorageAccount);
      expect(createTableServiceArgs.key).toEqual(settings.azureStorageAccessKey);
    });

    it('should call createTableIfNotExists and handle error', (done) => {
      spyOn(logger, 'error');

      const error = 'error5';
      lib.registerEntityToTable({}, {})
      .catch(err => {
        expect(err).toBe(error);
        expect(logger.error).toHaveBeenCalledWith(error);
        done();
      });
      createTableIfNotExistsArgs.cb(error);
    });

    it('should call insertOrReplaceEntity and handle success', () => {
      const settings = { name: 'custom-name3' };

      spyOn(logger, 'info');
      lib.registerEntityToTable(settings, {});
      createTableIfNotExistsArgs.cb();
      insertOrReplaceEntityArgs.cb();

      expect(logger.info).toHaveBeenCalledWith(
        'SPA %s registered in table storage.',
        settings.name
      );

    });

    it('should call insertOrReplaceEntity and handle error', (done) => {
      spyOn(logger, 'error');
      const error = 'error6';
      lib.registerEntityToTable({}, {})
        .catch(err => {
          expect(err).toBe(error);
          expect(logger.error).toHaveBeenCalledWith(error);
          done();
        });
      createTableIfNotExistsArgs.cb();
      insertOrReplaceEntityArgs.cb(error);
    });

  });
});
