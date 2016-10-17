/*jshint jasmine: true, node: true */
'use strict';

describe('sky-pages-deploy lib publish', () => {

  const mock = require('mock-require');

  it('should create an entity and call registerEntityToTable', () => {
    let settingsTest = false;
    let entityTest = {};

    mock('../lib/azure', {
      generator: {
        String: s => s
      },
      registerEntityToTable: (settings, entity) => {
        settingsTest = settings.test;
        entityTest = entity;
      }
    });

    require('../lib/publish')({
      name: 'custom-name',
      version: 'custom-version',
      test: true
    });

    expect(settingsTest).toEqual(true);
    expect(entityTest.PartitionKey).toEqual('custom-name');
    expect(entityTest.RowKey).toEqual('__default');
    expect(entityTest.Version).toEqual('custom-version');
    mock.stop('../lib/azure');
  });

});
