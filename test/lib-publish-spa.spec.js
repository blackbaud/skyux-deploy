'use strict';

describe('skyux-deploy lib publish SPA', () => {

  const mock = require('mock-require');

  let portalMock;
  let lib;

  beforeEach(() => {
    portalMock = {
      publishSpa: jasmine.createSpy('publishSpa').and.returnValue(Promise.resolve())
    };

    mock('../lib/portal', portalMock);

    lib = mock.reRequire('../lib/publish-spa');
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should create an entity and call publishSpa', () => {
    lib({
      azureStorageAccessKey: 'abc',
      name: 'custom-name',
      version: 'custom-version'
    });

    expect(portalMock.publishSpa).toHaveBeenCalledWith(
      'abc',
      {
        name: 'custom-name',
        version: 'custom-version'
      }
    );
  });

});
