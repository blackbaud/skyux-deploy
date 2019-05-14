'use strict';

const mock = require('mock-require');

describe('skyux-deploy lib portal', () => {
  let portal;
  let requestMock;

  function validateSuccess(method, url, sharedKey, spa) {
    expect(requestMock).toHaveBeenCalledWith(
      url,
      {
        headers: {
          'X-BB-Shared-Key': sharedKey
        },
        method,
        json: spa
      },
      jasmine.any(Function)
    );
  }

  function mockError() {
    const expectedError = {
      message: 'Forbidden'
    };

    requestMock.and.callFake((url, options, callback) => {
      callback(
        undefined,
        {
          statusCode: 403,
          body: [
            {
              message: 'Forbidden'
            }
          ]
        }
      )
    });

    return expectedError;
  }

  beforeEach(() => {
    requestMock = jasmine.createSpy('request').and.callFake((url, options, callback) => {
      callback(
        undefined,
        {
          statusCode: 200
        }
      )
    });

    mock('request', requestMock);

    portal = mock.reRequire('../lib/portal');
  });

  afterEach(() => {
    mock.stopAll();
  });

  describe('deploySpa() method', () => {

    it('should make the expected request', async () => {
      await portal.deploySpa(
        'abc',
        {
          name: 'spa-name'
        },
        'version1'
      );

      validateSuccess(
        'POST',
        `${portal.baseUrl}spas/spa-name/versions/version1`,
        'abc',
        {
          name: 'spa-name'
        }
      );
    });

    it('should handle a non-200 response', () => {
      var expectedError = mockError();

      expectAsync(portal.deploySpa(
        'abc',
        {
          name: 'spa-name'
        },
        'version1'
      )).toBeRejectedWith(expectedError);
    });

  });

  describe('publishSpa() method', () => {

    it('should make the expected request', () => {
      portal.publishSpa(
        'abc',
        {
          name: 'spa-name',
          version: 'version1'
        }
      );

      validateSuccess(
        'PUT',
        `${portal.baseUrl}spas/spa-name/release`,
        'abc',
        {
          name: 'spa-name',
          version: 'version1'
        }
      );
    });

    it('should handle a non-200 response', () => {
      var expectedError = mockError();

      expectAsync(portal.publishSpa(
        'abc',
        {
          name: 'spa-name',
          version: 'version1'
        }
      )).toBeRejectedWith(expectedError);
    });

  });

});
