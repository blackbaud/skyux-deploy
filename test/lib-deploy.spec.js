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

  let assetsMock;
  let azureMock;
  let deploySpaMock;
  let deployStaticMock;
  let lib;

  beforeEach(() => {
    spyOn(logger, 'error');
    spyOn(logger, 'info');

    azureMock = {
      registerAssetsToBlob: jasmine.createSpy('registerAssetsToBlob').and.returnValue(Promise.resolve())
    };

    assetsMock = {
      getDistAssets: jasmine.createSpy('getDistAssets').and.returnValue([distAsset]),
      getEmittedAssets: jasmine.createSpy('getEmittedAssets').and.returnValue([emittedAsset])
    };

    deploySpaMock = jasmine.createSpy('deploySpa').and.returnValue(Promise.resolve());
    deployStaticMock = jasmine.createSpy('deployStatic').and.returnValue(Promise.resolve());

    mock('../lib/azure', azureMock);
    mock('../lib/assets', assetsMock);
    mock('../lib/deploy-spa', deploySpaMock);
    mock('../lib/deploy-static', deployStaticMock);

    lib = mock.reRequire('../lib/deploy');
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should call registerAssetsToBlob with the expected parameters', async () => {
    await lib({
      name: 'custom-name1',
      version: 'custom-version1'
    });

    expect(azureMock.registerAssetsToBlob).toHaveBeenCalledWith(
      {
        name: 'custom-name1',
        version: 'custom-version1'
      },
      [
        distAsset,
        emittedAsset
      ]
    );
  });

  it('should handle an error after calling registerEntityToBlob', async () => {
    azureMock.registerAssetsToBlob.and.returnValue(Promise.reject('custom-error1'));

    await expectAsync(lib({})).toBeRejectedWith('custom-error1');

    expect(logger.error).toHaveBeenCalledWith('custom-error1');
  });

  it('should reject if there are no assets found', async () => {
    assetsMock.getDistAssets.and.returnValue([]);
    assetsMock.getEmittedAssets.and.returnValue([]);

    await expectAsync(lib({})).toBeRejectedWith('Unable to locate any assets to deploy.');
  });

  describe('when isStaticClient = false', () => {
    it('should call deploySpa if registerAssetsToBlob is successful', async () => {
      const settings = {
        azureStorageAccessKey: 'abc',
        name: 'custom-name2',
        version: 'custom-version2',
        skyuxConfig: { test1: true },
        packageConfig: { test2: true }
      };

      await lib(settings);

      expect(deploySpaMock).toHaveBeenCalledWith(settings, [distAsset]);
      expect(deployStaticMock).not.toHaveBeenCalled();
    });

    it('should handle an error after calling deploySpa', async () => {
      deploySpaMock.and.returnValue(Promise.reject('custom-error2'));

      await expectAsync(lib({})).toBeRejectedWith('custom-error2');

      expect(logger.error).toHaveBeenCalledWith('custom-error2');
    });

    it('should display a message if deploySpa is successful', async () => {
      await lib({});

      expect(logger.info).toHaveBeenCalledWith('Successfully registered.');
    });
  });

  describe('when isStaticClient = true', () => {
    it('should call deployStatic if registerAssetsToBlob is successful', async () => {
      const settings = {
        azureStorageAccessKey: 'abc',
        name: 'custom-name2',
        isStaticClient: true,
        version: 'custom-version2',
        skyuxConfig: { test1: true },
        packageConfig: { test2: true }
      };

      await lib(settings);

      expect(deployStaticMock).toHaveBeenCalledWith(settings, [distAsset]);
      expect(deploySpaMock).not.toHaveBeenCalled();
    });

    it('should handle an error after calling deployStatic', async () => {
      deployStaticMock.and.returnValue(Promise.reject('custom-error2'));

      await expectAsync(lib({isStaticClient: true})).toBeRejectedWith('custom-error2');

      expect(logger.error).toHaveBeenCalledWith('custom-error2');
    });

    it('should display a message if deploySpa is successful', async () => {
      await lib({isStaticClient: true});

      expect(logger.info).toHaveBeenCalledWith('Successfully registered.');
    });
  });

});
