/*jshint jasmine: true, node: true */
'use strict';

describe('skyux-deploy lib azure', () => {
  const mock = require('mock-require');
  const logger = require('@blackbaud/skyux-logger');

  let lib;

  let mockCompression;
  let mockContainerClient;
  let mockTableClient;
  let mockBlockBlobClients;
  let mockSharedKeyCredential;

  beforeEach(() => {
    mockBlockBlobClients = {};

    mockContainerClient = {
      createIfNotExists: jasmine.createSpy('createIfNotExists').and.resolveTo(),
      getBlockBlobClient: jasmine
        .createSpy('getBlockBlobClient')
        .and.callFake((name) => {
          mockBlockBlobClients[name] = mockBlockBlobClients[name] || {
            upload: jasmine.createSpy('upload').and.resolveTo({}),
            uploadFile: jasmine.createSpy('uploadFile').and.resolveTo({}),
          };

          return mockBlockBlobClients[name];
        }),
    };

    mockTableClient = {
      createTable: jasmine.createSpy('createTable').and.resolveTo(),
      upsertEntity: jasmine.createSpy('upsertEntity').and.resolveTo(),
    };

    mockSharedKeyCredential = {};

    mock('@azure/storage-blob', {
      ContainerClient: function (...args) {
        mockContainerClient.__ctorArgs = args;
        return mockContainerClient;
      },
      StorageSharedKeyCredential: function (...args) {
        mockSharedKeyCredential.__ctorArgs = args;
        return mockSharedKeyCredential;
      },
    });

    mock('@azure/data-tables', {
      TableClient: function (...args) {
        mockTableClient.__ctorArgs = args;
        return mockTableClient;
      },
      AzureNamedKeyCredential: function (...args) {
        mockSharedKeyCredential.__ctorArgs = args;
        return mockSharedKeyCredential;
      },
    });

    mockCompression = jasmine.createSpyObj('compression', [
      'canBeCompressed',
      'compress',
      'compressFile',
    ]);

    mock('../lib/compression', mockCompression);

    lib = mock.reRequire('../lib/azure');
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should expose a registerAssetsToBlob method', () => {
    expect(lib.registerAssetsToBlob).toBeDefined();
  });

  it('should expose a registerEntityToTable metho', () => {
    expect(lib.registerEntityToTable).toBeDefined();
  });

  describe('registerAssetsToBlob', () => {
    it('should create a ContainerClient with the expected args', async () => {
      spyOn(logger, 'error');

      const settings = {
        azureStorageAccount: 'account-name',
        azureStorageAccessKey: 'foo',
        name: 'blob-name1',
      };

      await lib.registerAssetsToBlob(settings, []);

      expect(mockContainerClient.__ctorArgs).toEqual([
        'https://account-name.blob.core.windows.net/blob-name1',
        {
          __ctorArgs: ['account-name', 'foo'],
        },
      ]);
    });

    it('should call ContainerClient.createIfNotExists() and handle error', async () => {
      spyOn(logger, 'error');

      const testError = new Error('error1');
      const settings = { name: 'blob-name1' };

      mockContainerClient.createIfNotExists.and.rejectWith(testError);

      await expectAsync(
        lib.registerAssetsToBlob(settings, [])
      ).toBeRejectedWith(testError);
      expect(logger.error).toHaveBeenCalledWith(testError);
    });

    it('should call ContainerClient.createIfNotExists() and handle success', async () => {
      spyOn(logger, 'info');

      const settings = { name: 'blob-name2' };
      const assets = [
        {
          name: 'asset-name1',
          content: 'asset-content1',
        },
      ];

      await lib.registerAssetsToBlob(settings, assets);

      expect(logger.info).toHaveBeenCalled();

      expect(mockContainerClient.getBlockBlobClient).toHaveBeenCalledWith(
        assets[0].name
      );

      expect(mockBlockBlobClients[assets[0].name].upload).toHaveBeenCalledWith(
        assets[0].content,
        assets[0].content.length,
        {
          blobHTTPHeaders: {
            blobContentType: 'application/octet-stream',
          },
        }
      );
    });

    it('should publish CSS files with the appropriate content type and compressed files', async () => {
      spyOn(logger, 'info');

      mockCompression.canBeCompressed.and.callFake((_asset, contentType) =>
        Promise.resolve(contentType === 'text/css')
      );
      mockCompression.compress.and.callFake(() => {
        return {
          brotli: 'abc',
          gzip: 'xyz',
        };
      });

      const settings = { name: 'blob-name2' };
      const assets = [
        {
          name: 'asset-name1.css',
          content: 'body { color: green; }',
        },
      ];

      await lib.registerAssetsToBlob(settings, assets);

      expect(mockBlockBlobClients[assets[0].name].upload).toHaveBeenCalledWith(
        assets[0].content,
        assets[0].content.length,
        {
          blobHTTPHeaders: {
            blobContentType: 'text/css',
          },
          metadata: {
            brotli: '1',
            gzip: '1',
          },
        }
      );

      expect(
        mockBlockBlobClients[assets[0].name + '.br'].upload
      ).toHaveBeenCalledWith('abc', 3, {
        blobHTTPHeaders: {
          blobContentType: 'application/octet-stream',
        },
      });

      expect(
        mockBlockBlobClients[assets[0].name + '.gz'].upload
      ).toHaveBeenCalledWith('xyz', 3, {
        blobHTTPHeaders: {
          blobContentType: 'application/gzip',
        },
      });
    });

    it('should call BlockBlobClient.upload() and handle error', async () => {
      const testError = new Error('error2');

      mockContainerClient.createIfNotExists.and.rejectWith(testError);

      const settings = { name: 'blob-name2' };
      const assets = [
        {
          name: 'asset-name1',
          content: 'asset-content1',
        },
      ];

      spyOn(logger, 'error');
      await expectAsync(
        lib.registerAssetsToBlob(settings, assets)
      ).toBeRejectedWith(testError);
      expect(logger.error).toHaveBeenCalledWith(testError);
    });

    it('should call BlockBlobClient.uploadFile() and handle success', async () => {
      const settings = { name: 'blob-name3' };
      const assets = [
        {
          name: 'asset-name2.jpg',
          file: '/home/assets/asset-name2.jpg',
        },
      ];

      await lib.registerAssetsToBlob(settings, assets);

      expect(mockContainerClient.getBlockBlobClient).toHaveBeenCalledWith(
        assets[0].name
      );

      expect(
        mockBlockBlobClients[assets[0].name].uploadFile
      ).toHaveBeenCalledWith(assets[0].file, {
        blobHTTPHeaders: {
          blobContentType: 'image/jpeg',
        },
      });
    });

    it('should call BlockBlobClient.uploadFile() and upload compressed versions', async () => {
      mockCompression.canBeCompressed.and.callFake((_asset, contentType) =>
        Promise.resolve(contentType === 'application/javascript')
      );
      mockCompression.compressFile.and.callFake(() => {
        return {
          brotli: 'abc',
          gzip: 'xyz',
        };
      });

      const settings = { name: 'blob-name3' };
      const assets = [
        {
          name: 'asset-name2.js',
          file: '/home/assets/asset-name2.js',
        },
      ];

      await lib.registerAssetsToBlob(settings, assets);

      expect(
        mockBlockBlobClients[assets[0].name].uploadFile
      ).toHaveBeenCalledWith(assets[0].file, {
        blobHTTPHeaders: {
          blobContentType: 'application/javascript',
        },
        metadata: {
          brotli: '1',
          gzip: '1',
        },
      });

      expect(
        mockBlockBlobClients[assets[0].name + '.br'].upload
      ).toHaveBeenCalledWith('abc', 3, {
        blobHTTPHeaders: {
          blobContentType: 'application/octet-stream',
        },
      });

      expect(
        mockBlockBlobClients[assets[0].name + '.gz'].upload
      ).toHaveBeenCalledWith('xyz', 3, {
        blobHTTPHeaders: {
          blobContentType: 'application/gzip',
        },
      });
    });

    it('should handle unknown MIME types', async () => {
      const settings = { name: 'blob-name3' };
      const assets = [
        {
          name: 'asset-name2.#%*@)',
          file: '/home/assets/asset-name2.#%*@)',
        },
      ];

      await lib.registerAssetsToBlob(settings, assets);

      expect(mockContainerClient.getBlockBlobClient).toHaveBeenCalledWith(
        assets[0].name
      );

      expect(
        mockBlockBlobClients[assets[0].name].uploadFile
      ).toHaveBeenCalledWith(assets[0].file, {
        blobHTTPHeaders: {
          blobContentType: 'application/octet-stream',
        },
      });
    });

    it('should call BlockBlobClient.uploadFile() and handle error', async () => {
      const testError = new Error('error4');
      const settings = { name: 'blob-name4' };
      const assets = [
        {
          name: 'asset-name3.jpg',
          file: '/home/assets/asset-name3.jpg',
        },
      ];

      mockContainerClient
        .getBlockBlobClient(assets[0].name)
        .uploadFile.and.rejectWith(testError);

      spyOn(logger, 'error');
      await expectAsync(
        lib.registerAssetsToBlob(settings, assets)
      ).toBeRejectedWith(testError);
      expect(logger.error).toHaveBeenCalledWith(testError);
    });

    it('should throw an error if no assets', async () => {
      spyOn(logger, 'error');
      await expectAsync(lib.registerAssetsToBlob({})).toBeRejectedWithError(
        'Assets are required.'
      );
    });

    it('should log an error if there was unknown asset type', async () => {
      spyOn(logger, 'error');
      const error = 'Unknown asset type.';

      await expectAsync(
        lib.registerAssetsToBlob({}, [{ type: 'unknown' }])
      ).toBeRejectedWithError(error);
      expect(logger.error).toHaveBeenCalledWith(new Error(error));
    });
  });

  describe('registerEntityToTable', () => {
    it('should create a table service using the supplied credentials', async () => {
      const settings = {
        azureStorageAccount: 'account2',
        azureStorageAccessKey: 'key2',
        azureStorageTableName: 'table1',
      };

      await lib.registerEntityToTable(settings);

      expect(mockTableClient.__ctorArgs).toEqual([
        'https://account2.table.core.windows.net',
        'table1',
        {
          __ctorArgs: [
            settings.azureStorageAccount,
            settings.azureStorageAccessKey,
          ],
        },
      ]);
    });

    it('should call TableClient.createTable() and handle error', async () => {
      spyOn(logger, 'error');

      const testError = new Error('error5');

      mockTableClient.createTable.and.rejectWith(testError);

      await expectAsync(lib.registerEntityToTable({}, {})).toBeRejectedWith(
        testError
      );
      expect(logger.error).toHaveBeenCalledWith(testError);
    });

    it('should call Table.upsertEntity() and handle success', async () => {
      const settings = { name: 'custom-name3' };
      const entity = {
        foo: 'bar',
      };

      spyOn(logger, 'info');
      await lib.registerEntityToTable(settings, entity);

      expect(mockTableClient.upsertEntity).toHaveBeenCalledWith(
        entity,
        'Replace'
      );

      expect(logger.info).toHaveBeenCalledWith(
        '%s registered in table storage.',
        settings.name
      );
    });

    it('should call Table.upsertEntity() and handle error', async () => {
      spyOn(logger, 'error');
      const testError = new Error('error6');

      mockTableClient.upsertEntity.and.rejectWith(testError);

      await expectAsync(lib.registerEntityToTable({}, {})).toBeRejectedWith(
        testError
      );
      expect(logger.error).toHaveBeenCalledWith(testError);
    });
  });
});
