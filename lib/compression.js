const brotli = require('brotli');
const fs = require('fs-extra');
const gzip = require('node-gzip');
const zlib = require('zlib');

const compressibleContentTypes = new Set([
  'text/html',
  'text/css',
  'text/plain',
  'text/xml',
  'text/x-component',
  'text/javascript',
  'application/x-javascript',
  'application/javascript',
  'application/json',
  'application/manifest+json',
  'application/vnd.api+json',
  'application/xml',
  'application/xhtml+xml',
  'application/rss+xml',
  'application/atom+xml',
  'application/vnd.ms-fontobject',
  'application/x-font-ttf',
  'application/x-font-opentype',
  'application/x-font-truetype',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'font/ttf',
  'font/eot',
  'font/otf',
  'font/opentype',
]);

const MIN_FILE_SIZE_BYTES = 1000;

async function canBeCompressed(asset, contentType) {
  if (compressibleContentTypes.has(contentType)) {
    if (asset.content) {
      return asset.content.length >= MIN_FILE_SIZE_BYTES;
    } else if (asset.file) {
      const stat = await fs.stat(asset.file);
      return stat.size >= MIN_FILE_SIZE_BYTES;
    }
  }

  return false;
}

async function compressBuffer(source, isText) {
  return {
    brotli: brotli.compress(source, {
      mode: isText
        ? zlib.constants.BROTLI_MODE_TEXT
        : zlib.constants.BROTLI_MODE_GENERIC,
      quality: zlib.constants.BROTLI_MAX_QUALITY,
    }),
    gzip: await gzip.gzip(source, {
      level: zlib.constants.Z_BEST_COMPRESSION,
    }),
  };
}

async function compress(contents) {
  const buffer = Buffer.from(contents, 'utf-8');
  return await compressBuffer(buffer, true);
}

async function compressFile(filePath) {
  const buffer = await fs.readFile(filePath);
  return await compressBuffer(buffer);
}

module.exports = {
  canBeCompressed,
  compress,
  compressFile,
};
