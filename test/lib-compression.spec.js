/*jshint jasmine: true, node: true */
'use strict';

const zlib = require('zlib');

describe('skyux-deploy lib azure', () => {
  const mock = require('mock-require');

  let lib;

  let mockBrotli;
  let mockFs;
  let mockGzip;

  beforeEach(() => {
    mockBrotli = jasmine.createSpyObj('brotli', ['compress']);
    mockFs = jasmine.createSpyObj('fs-extra', ['readFile']);
    mockGzip = jasmine.createSpyObj('node-gzip', ['gzip']);

    mock('brotli', mockBrotli);
    mock('fs-extra', mockFs);
    mock('node-gzip', mockGzip);

    lib = mock.reRequire('../lib/compression');
  });

  afterEach(() => {
    mock.stopAll();
  });

  describe('canBeCompressed()', () => {
    it('should return value indicating whether the specified content type can be compressed', () => {
      expect(lib.canBeCompressed('text/css')).toBeTrue();
      expect(lib.canBeCompressed('application/javascript')).toBeTrue();
      expect(lib.canBeCompressed('application/jpeg')).toBeFalse();
      expect(lib.canBeCompressed('application/octet-stream')).toBeFalse();
    });
  });

  describe('compress()', () => {
    it('should compress specified contents as text', async () => {
      mockBrotli.compress.and.callFake((content, options) => {
        if (
          content.toString() === 'some text' &&
          options.mode === zlib.constants.BROTLI_MODE_TEXT &&
          options.quality === zlib.constants.BROTLI_MAX_QUALITY
        ) {
          return 'abc';
        }
      });

      mockGzip.gzip.and.callFake((content, options) => {
        if (
          content.toString() === 'some text' &&
          options.level === zlib.constants.Z_BEST_COMPRESSION
        ) {
          return Promise.resolve('abc');
        }
      });

      mockGzip.gzip.and.resolveTo('xyz');

      await expectAsync(lib.compress('some text')).toBeResolvedTo({
        brotli: 'abc',
        gzip: 'xyz',
      });
    });
  });

  describe('compressFile()', () => {
    it('should compress specified file', async () => {
      mockFs.readFile.and.callFake((filePath) => {
        if (filePath === 'file1.txt') {
          return 'file contents';
        }
      });

      mockBrotli.compress.and.callFake((content, options) => {
        if (
          content.toString() === 'file contents' &&
          options.mode === zlib.constants.BROTLI_MODE_GENERIC &&
          options.quality === zlib.constants.BROTLI_MAX_QUALITY
        ) {
          return 'abc';
        }
      });

      mockGzip.gzip.and.callFake((content, options) => {
        if (
          content.toString() === 'file contents' &&
          options.level === zlib.constants.Z_BEST_COMPRESSION
        ) {
          return Promise.resolve('xyz');
        }
      });

      await expectAsync(lib.compressFile('file1.txt')).toBeResolvedTo({
        brotli: 'abc',
        gzip: 'xyz',
      });
    });
  });
});
