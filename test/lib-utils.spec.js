'use strict';

describe('skyux-deploy lib utils', () => {

  const logger = require('@blackbaud/skyux-logger');
  let utils;

  beforeEach(() => {
    spyOn(logger, 'error');
    utils = require('../lib/utils');
  });

  it('handleError should not log if no error', () => {
    utils.handleError();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('handleError should log special "already exists" error', () => {
    utils.handleError('already exists');
    expect(logger.error).toHaveBeenCalledWith('Already been registered in table storage.');
  });

  it('handleError should log generic error', () => {
    utils.handleError('error');
    expect(logger.error).toHaveBeenCalledWith('error');
  });

  it('rejectIfError should not log nor reject if no error', () => {
    let called = false;
    const cb = () => {
      called = true;
    };

    utils.rejectIfError(cb);
    expect(logger.error).not.toHaveBeenCalled();
    expect(called).toEqual(false);
  });

  it('rejectIfError should log and reject if error', () => {
    let called = false;
    const cb = () => {
      called = true;
    };

    utils.rejectIfError(cb, 'error');
    expect(logger.error).toHaveBeenCalledWith('error');
    expect(called).toEqual(true);
  });

  it('validate should log error if no assets', () => {
    const validated = utils.validate([], {
      name: 'test'
    });
    expect(validated).toEqual(false);
    expect(logger.error).toHaveBeenCalledWith(
      'Unable to find any matching assets in SPA %s.',
      'test'
    );
  });

  it('validate should log error for required settings', () => {
    const assets = ['test'];
    const settings = {
      version: '',
      azureStorageAccount: '',
      azureStorageAccessKey: '',
      azureStorageTableName: ''
    };
    const validated = utils.validate(assets, settings);

    expect(validated).toEqual(false);
    expect(logger.error).toHaveBeenCalledWith(
      '%s is required.',
      'name'
    );
  });

});
