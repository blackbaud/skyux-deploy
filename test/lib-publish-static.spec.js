'use strict';

describe('skyux-deploy lib publish static', () => {

  const mock = require('mock-require');

  let azureMock;
  let lib;

  beforeEach(() => {
    azureMock = {
      registerEntityToTable: jasmine.createSpy('registerEntityToTable')
    };

    mock('../lib/azure', azureMock);

    lib = mock.reRequire('../lib/publish-static');
  });

  afterEach(() => {
    mock.stopAll();
  })

  it('should create an entity and call registerEntityToTable', () => {

    lib({
      name: 'custom-name',
      version: 'custom-version',
      test: true
    });

    expect(azureMock.registerEntityToTable).toHaveBeenCalledWith(
      {
        name: 'custom-name',
        version: 'custom-version',
        test: true
      },
      {
        partitionKey: 'custom-name',
        rowKey: '__default',
        Version: 'custom-version'
      }
    );

    mock.stopAll();
  });

});
