'use strict';

describe('skyux-deploy lib publish', () => {

  const mock = require('mock-require');

  let publishSpaMock;
  let publishStaticMock;
  let publish;

  beforeEach(() => {
    publishSpaMock = jasmine.createSpy('publishSpa');
    publishStaticMock = jasmine.createSpy('publishStatic');

    mock('../lib/publish-spa', publishSpaMock);
    mock('../lib/publish-static', publishStaticMock);

    publish = mock.reRequire('../lib/publish');
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should publish as a SPA when settings.isStaticClient = false', () => {
    publish({
      azureStorageAccessKey: 'abc',
      isStaticClient: false,
      name: 'custom-name',
      version: 'custom-version'
    });

    expect(publishSpaMock).toHaveBeenCalledWith(
      {
        azureStorageAccessKey: 'abc',
        isStaticClient: false,
        name: 'custom-name',
        version: 'custom-version'
      }
    );

    expect(publishStaticMock).not.toHaveBeenCalled();
  });

  it('should publish as a static client when settings.isStaticClient = true', () => {
    publish({
      azureStorageAccessKey: 'abc',
      isStaticClient: true,
      name: 'custom-name',
      version: 'custom-version'
    });

    expect(publishStaticMock).toHaveBeenCalledWith(
      {
        azureStorageAccessKey: 'abc',
        isStaticClient: true,
        name: 'custom-name',
        version: 'custom-version'
      }
    );

    expect(publishSpaMock).not.toHaveBeenCalled();
  });

});
