'use strict';

describe('skyux-deploy lib deploy SPA', () => {

  const mock = require('mock-require');
  const logger = require('@blackbaud/skyux-logger');

  let assetsMock;
  let portalMock;
  let lib;

  beforeEach(() => {
    spyOn(logger, 'error');
    spyOn(logger, 'info');

    assetsMock = {
      getDistAssets: jasmine.createSpy('getDistAssets')
        .and
        .returnValue([
          {
            name: 'my-asset.js',
            content: 'my-content'
          }
        ]),
    };

    portalMock = {
      deploySpa: jasmine.createSpy('deploySpa').and.returnValue(Promise.resolve())
    };

    mock('../lib/assets', assetsMock);
    mock('../lib/portal', portalMock);

    lib = mock.reRequire('../lib/deploy-spa');
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should call deploySpa with the expected parameters', async () => {
    await lib(
      {
        azureStorageAccessKey: 'abc',
        name: 'custom-name2',
        version: 'custom-version2',
        skyuxConfig: { test1: true },
        packageConfig: { test2: true }
      }
    );

    expect(portalMock.deploySpa).toHaveBeenCalledWith(
      'abc',
      {
        name: 'custom-name2',
        sky_ux_config: {
          test1: true
        },
        package_config: {
          test2: true
        },
        scripts: [
          {
            name: 'my-asset.js',
            content: 'my-content'
          }
        ]
      },
      'custom-version2'
    );
  });

});
