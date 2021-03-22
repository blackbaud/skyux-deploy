'use strict';

describe('skyux-deploy lib deploy SPA', () => {

  const mock = require('mock-require');
  const logger = require('@blackbaud/skyux-logger');

  let assetsMock;
  let portalMock;
  let lib;
  let mockAssets;

  beforeEach(() => {
    spyOn(logger, 'error');
    spyOn(logger, 'info');

    mockAssets = [
      {
        name: 'my-asset.js',
        content: 'my-content',
        type: 'script'
      }
    ];

    assetsMock = {
      getDistAssets: jasmine.createSpy('getDistAssets')
        .and
        .returnValue(mockAssets),
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
            content: 'my-content',
            type: 'script'
          }
        ]
      },
      'custom-version2'
    );
  });

  it('should deploy SPA with root element tag name', async () => {
    await lib({
      azureStorageAccessKey: 'abc',
      name: 'custom-name2',
      version: 'custom-version2',
      rootElementTagName: 'app-root',
      skyuxConfig: { test1: true },
      packageConfig: { test2: true }
    });

    const actualTagName = portalMock.deploySpa
      .calls
      .mostRecent()
      .args[1]
      .root_element_tag_name;

    expect(actualTagName).toEqual('app-root');
  });

  it('should call deploySpa with style sheets', async () => {
    mockAssets.push({
      name: 'styles.css',
      type: 'styleSheet'
    });

    await lib(
      {
        azureStorageAccessKey: 'abc',
        name: 'custom-name2',
        version: 'custom-version2',
        skyuxConfig: { test1: true },
        packageConfig: { test2: true }
      }
    );

    expect(portalMock.deploySpa.calls.mostRecent().args[1].styleSheets).toEqual([
      {
        name: 'styles.css',
        type: 'styleSheet'
      }
    ]);
  });

});
