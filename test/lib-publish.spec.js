'use strict';

describe('skyux-deploy lib publish', () => {

  const mock = require('mock-require');

  it('should create an entity and call publishSpa', () => {
    const portalMock = {
      publishSpa: jasmine.createSpy('publishSpa').and.returnValue(Promise.resolve())
    };

    mock('../lib/portal', portalMock);

    require('../lib/publish')({
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

    mock.stopAll();
  });

});
