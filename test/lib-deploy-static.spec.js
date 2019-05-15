'use strict';

describe('skyux-deploy lib deploy static', () => {

  const mock = require('mock-require');
  const logger = require('@blackbaud/skyux-logger');

  let azureMock;
  let lib;

  beforeEach(() => {
    spyOn(logger, 'error');
    spyOn(logger, 'info');

    azureMock = {
      generator: {
        String: s => s
      },
      registerEntityToTable: jasmine.createSpy('registerEntityToTable').and.returnValue(Promise.resolve())
    };

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

    const assets = [
      {
        name: 'my-asset.js',
        content: 'my-content'
      }
    ];

    await lib(
      settings,
      assets
    );

    expect(azureMock.registerEntityToTable).toHaveBeenCalledWith(
      settings,
      {
        PartitionKey: 'custom-name2',
        RowKey: 'custom-version2',
        SkyUXConfig: JSON.stringify(settings.skyuxConfig),
        PackageConfig: JSON.stringify(settings.packageConfig),
        Scripts: JSON.stringify(assets)
      }
    );
  });

});
