/*jshint jasmine: true, node: true */
'use strict';

describe('skyux-deploy lib azure', () => {

  const mock = require('mock-require');
  // const azure = require('azure-storage');
  // const utils = require('../lib/utils');
  const logger = require('@blackbaud/skyux-logger');

  let lib;
  let createBlobServiceArgs;
  let createTableServiceArgs;
  let createBlockBlobFromTextArgs;
  let createBlockBlobFromLocalFileArgs;
  let createContainerIfNotExistsArgs;
  let createTableIfNotExistsArgs;
  let insertOrReplaceEntityArgs;

  beforeEach(() => {

    createBlobServiceArgs = {};
    createTableServiceArgs = {};
    createBlockBlobFromTextArgs = {};
    createBlockBlobFromLocalFileArgs = {};
    createContainerIfNotExistsArgs = {};
    createTableIfNotExistsArgs = {};
    insertOrReplaceEntityArgs = {};

    mock('azure-storage', {
      createBlobService: (account, key) => {
        createBlobServiceArgs = {
          account: account,
          key: key
        };

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

    it('should call createContainerIfNotExist and handle error', async () => {
      spyOn(logger, 'error');

      const errCustom = 'custom-error-1';
      const settings = { blobName: 'blob-name1' };

      const registerPromise = lib.registerAssetsToBlob(settings, []);
      let errCaught;

      createContainerIfNotExistsArgs.cb(errCustom);

      try {
        await registerPromise;
      } catch (e) {
        errCaught = e;
      }

      expect(errCaught).toBe(errCustom);
      expect(logger.error).toHaveBeenCalledWith(errCustom);
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

    it('should call createBlockBlobFromText and handle error', async () => {
      spyOn(logger, 'error');

      const errCustom = 'custom-error-2';
      const settings = { blobName: 'blob-name2' };
      const assets = [{
        name: 'asset-name1',
        content: 'asset-content1'
      }];

      const registerPromsie = lib.registerAssetsToBlob(settings, assets);
      let errCaught;

      createContainerIfNotExistsArgs.cb();
      createBlockBlobFromTextArgs.cb(errCustom);

      try {
        await registerPromsie;
      } catch (e) {
        errCaught = e;
      }

      expect(errCaught).toBe(errCustom);
      expect(logger.error).toHaveBeenCalledWith(errCustom);
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

    it('should call createBlockBlobFromLocalFile and handle error', async () => {
      spyOn(logger, 'error');

      const errCustom = 'custom-error-4';
      const settings = { blobName: 'blob-name4' };
      const assets = [{
        name: 'asset-name3.jpg',
        file: '/home/assets/asset-name3.jpg'
      }];

      const registerPromise = lib.registerAssetsToBlob(settings, assets);
      let errCaught;

      createContainerIfNotExistsArgs.cb();
      createBlockBlobFromLocalFileArgs.cb(errCustom);

      try {
        await registerPromise;
      } catch (e) {
        errCaught = e;
      }

      expect(errCaught).toBe(errCustom);
      expect(logger.error).toHaveBeenCalledWith(errCustom);
    });

    it('should throw an error if no assets', async () => {
      spyOn(logger, 'error');
      let errCaught;

      try {
        await lib.registerAssetsToBlob({});
      } catch (e) {
        errCaught = e;
      }

      expect(errCaught).toEqual('Assets are required.');
    });

    it('should log an error if there was unknown asset type', async () => {
      spyOn(logger, 'error');

      const registerPromise = lib.registerAssetsToBlob({}, [{ type: 'unknown' }]);
      createContainerIfNotExistsArgs.cb();

      try {
        await registerPromise;
      } catch (e) {}

      expect(logger.error).toHaveBeenCalledWith('Unknown asset type.');
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

    it('should call createTableIfNotExists and handle error', async () => {
      spyOn(logger, 'error');

      const errCustom = 'custom-error-3';
      const registerPromise = lib.registerEntityToTable({}, {});
      let errCaught;

      createTableIfNotExistsArgs.cb(errCustom);

      try {
        await registerPromise;
      } catch (e) {
        errCaught = e;
      }

      expect(errCaught).toBe(errCustom);
      expect(logger.error).toHaveBeenCalledWith(errCustom);
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

    it('should call insertOrReplaceEntity and handle error', async () => {
      spyOn(logger, 'error');

      const errCustom = 'custom-error-5';
      const registerPromise = lib.registerEntityToTable({}, {});
      let errCaught;

      createTableIfNotExistsArgs.cb();
      insertOrReplaceEntityArgs.cb(errCustom);

      try {
        await registerPromise;
      } catch (e) {
        errCaught = e;
      }

      expect(errCaught).toBe(errCustom);
      expect(logger.error).toHaveBeenCalledWith(errCustom);
    });

  });
});
