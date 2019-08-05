'use strict';

describe('skyux-deploy lib utils', () => {

  const mock = require('mock-require');
  const logger = require('@blackbaud/skyux-logger');

  const semverSpy = jasmine.createSpyObj('semver', [
    'valid',
    'prerelease',
    'major'
  ]);

  let utils;

  beforeEach(() => {
    spyOn(logger, 'error');
    mock('semver', semverSpy);
    utils = mock.reRequire('../lib/utils');
  });

  describe('getValidMajorVersion', () => {
    it('should return undefined if the version is invalid', () => {
      semverSpy.valid.and.returnValue(false);
      expect(utils.getValidMajorVersion('invalid_version')).toBeUndefined();
    });

    it('should return undefined if the version is a pre-release', () => {
      semverSpy.valid.and.returnValue(true);
      semverSpy.prerelease.and.returnValue(true);
      expect(utils.getValidMajorVersion('1.0.0-alpha.0')).toBeUndefined();
    });

    it('should return the major version if the version valid and not a pre-release', () => {

      const majorVersion = 1; // Purposefully a number

      semverSpy.valid.and.returnValue(true);
      semverSpy.prerelease.and.returnValue(false);
      semverSpy.major.and.returnValue(majorVersion);

      expect(utils.getValidMajorVersion('1.0.0')).toBe(majorVersion.toString());
    });
  });

  describe('handleError', () => {
    it('should not log if no error', () => {
      utils.handleError();
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should log special "already exists" error', () => {
      utils.handleError('already exists');
      expect(logger.error).toHaveBeenCalledWith('Already been registered in table storage.');
    });

    it('should log generic error', () => {
      utils.handleError('error');
      expect(logger.error).toHaveBeenCalledWith('error');
    });
  });

  describe('rejectIfError', () => {
    it('should not log nor reject if no error', () => {
      let called = false;
      const cb = () => {
        called = true;
      };

      utils.rejectIfError(cb);
      expect(logger.error).not.toHaveBeenCalled();
      expect(called).toEqual(false);
    });

    it('should log and reject if error', () => {
      let called = false;
      const cb = () => {
        called = true;
      };

      utils.rejectIfError(cb, 'error');
      expect(logger.error).toHaveBeenCalledWith('error');
      expect(called).toEqual(true);
    });
  });

  describe('validate', () => {
    it('should log error if no assets', () => {
      const validated = utils.validate([], {
        name: 'test'
      });
      expect(validated).toEqual(false);
      expect(logger.error).toHaveBeenCalledWith(
        'Unable to find any matching assets in SPA %s.',
        'test'
      );
    });

    it('should log error for required settings', () => {
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

});
