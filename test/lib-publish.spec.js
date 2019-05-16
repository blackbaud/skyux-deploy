'use strict';

describe('skyux-deploy lib publish', () => {

  const mock = require('mock-require');

  const loggerInfoSuccess = 'Successfully published.';

  let loggerMock;
  let publishSpaMock;
  let publishStaticMock;
  let publish;

  async function callPublish(isStaticClient) {
    return publish({
      azureStorageAccessKey: 'abc',
      isStaticClient: isStaticClient,
      name: 'custom-name',
      version: 'custom-version'
    });
  }

  beforeEach(() => {
    loggerMock = jasmine.createSpyObj('logger', ['info', 'error']);
    publishSpaMock = jasmine.createSpy('publishSpa');
    publishStaticMock = jasmine.createSpy('publishStatic');

    mock('@blackbaud/skyux-logger', loggerMock);
    mock('../lib/publish-spa', publishSpaMock);
    mock('../lib/publish-static', publishStaticMock);

    publish = mock.reRequire('../lib/publish');
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should publish as a SPA when settings.isStaticClient = false', async () => {
    await callPublish(false);
    expect(publishSpaMock).toHaveBeenCalledWith(
      {
        azureStorageAccessKey: 'abc',
        isStaticClient: false,
        name: 'custom-name',
        version: 'custom-version'
      }
    );

    expect(publishStaticMock).not.toHaveBeenCalled();
    expect(loggerMock.info).toHaveBeenCalledWith(loggerInfoSuccess);
  });

  it('should publish as a static client when settings.isStaticClient = true', async () => {
    await callPublish(true);
    expect(publishStaticMock).toHaveBeenCalledWith(
      {
        azureStorageAccessKey: 'abc',
        isStaticClient: true,
        name: 'custom-name',
        version: 'custom-version'
      }
    );

    expect(publishSpaMock).not.toHaveBeenCalled();
    expect(loggerMock.info).toHaveBeenCalledWith(loggerInfoSuccess);
  });

  it('should log an error when settings.isStaticClient = false', async () => {
    const error = 'some-error-happened-is-static-client-false';
    publishSpaMock.and.callFake(() => {
      throw error;
    });

    await expectAsync(callPublish(false)).toBeRejectedWith(error);
    expect(loggerMock.error).toHaveBeenCalledWith(error);
  });

  it('should log an error when settings.isStaticClient = true', async () => {
    const error = 'some-error-happened-is-static-client-true';
    publishStaticMock.and.callFake(() => {
      throw error;
    });

    await expectAsync(callPublish(true)).toBeRejectedWith(error);
    expect(loggerMock.error).toHaveBeenCalledWith(error);
  });

});
