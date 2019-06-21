'use strict';

describe('skyux-deploy lib deploy static', () => {

  const mock = require('mock-require');
  const logger = require('@blackbaud/skyux-logger');

  const distAsset = [
    {
      name: 'my-asset.js',
      content: 'my-content'
    }
  ];

  let assetsMock;
  let azureMock;
  let lib;

  beforeEach(() => {
    spyOn(logger, 'error');
    spyOn(logger, 'info');

    assetsMock = {
      getDistAssets: jasmine.createSpy('getDistAssets').and.returnValue(distAsset)
    };

    azureMock = {
      generator: {
        String: s => s
      },
      registerEntityToTable: jasmine.createSpy('registerEntityToTable').and.returnValue(Promise.resolve())
    };

    mock('../lib/assets', assetsMock);
    mock('../lib/azure', azureMock);

    lib = mock.reRequire('../lib/deploy-static');
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should call registerEntityToTable with the expected parameters', async () => {
    const settings = {
      azureStorageAccessKey: 'abc',
      isStaticClient: true,
      name: 'custom-name2',
      version: 'custom-version2',
      skyuxConfig: { test1: true },
      packageConfig: { test2: true }
    };

    await lib(settings);

    expect(azureMock.registerEntityToTable).toHaveBeenCalledWith(
      settings,
      {
        PartitionKey: 'custom-name2',
        RowKey: 'custom-version2',
        SkyUXConfig: JSON.stringify(settings.skyuxConfig),
        PackageConfig: JSON.stringify(settings.packageConfig),
        Scripts: JSON.stringify(distAsset)
      }
    );
  });

  it('should log a warning if version is invalid', async () => {
    const settings = {
      version: 'INVALID_VERSION'
    };

    await lib(settings);

    expect(logger.info).toHaveBeenCalledWith(
      'Not updating latest major release as version in package.json is invalid or is a pre-release.'
    );
    expect(azureMock.registerEntityToTable).toHaveBeenCalledTimes(1);
  });

  it('should log a warning if version is pre-release', async () => {
    const settings = {
      version: '1.2.3-rc.0'
    };

    await lib(settings);

    expect(logger.info).toHaveBeenCalledWith(
      'Not updating latest major release as version in package.json is invalid or is a pre-release.'
    );
    expect(azureMock.registerEntityToTable).toHaveBeenCalledTimes(1);
  });

  it('should call registerEntityToTable with major and major-latest if version is valid and not pre-release', async () => {
    const settings = {
      azureStorageAccessKey: 'abc',
      isStaticClient: true,
      name: 'custom-name3',
      version: '3.2.1',
      skyuxConfig: { test1: true },
      packageConfig: { test2: true }
    };

    await lib(settings);

    expect(azureMock.registerEntityToTable).toHaveBeenCalledWith(
      settings,
      {
        PartitionKey: 'custom-name3',
        RowKey: '3',
        SkyUXConfig: JSON.stringify(settings.skyuxConfig),
        PackageConfig: JSON.stringify(settings.packageConfig),
        Scripts: JSON.stringify(distAsset)
      }
    );

    expect(azureMock.registerEntityToTable).toHaveBeenCalledWith(
      settings,
      {
        PartitionKey: 'custom-name3',
        RowKey: '3-latest',
        SkyUXConfig: JSON.stringify(settings.skyuxConfig),
        PackageConfig: JSON.stringify(settings.packageConfig),
        Scripts: JSON.stringify(distAsset)
      }
    );
  });

});
