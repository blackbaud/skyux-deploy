/*jshint node: true*/
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const merge = require('merge');
const path = require('path');

const dist = path.join(process.cwd(), 'dist');
const sriAlgorithm = 'sha384';
const readOptions = { encoding: 'utf8' };
/**
 * Returns an array of assets (files + metadata).
 * @name getDistAssets
 * @param {string} dist
 * @returns {Array} assets
 */
const getDistAssets = (includeContent) => {
  const metadataPath = path.join(dist, 'metadata.json');

  if (fs.existsSync(metadataPath)) {
    const metadata = require(metadataPath);

    return metadata.map((asset) => {
      const parsed = path.parse(asset.name);
      const content = fs.readFileSync(path.join(dist, asset.name), readOptions);
      const hash = getHash(content, 'md5', 'hex');

      if (includeContent) {
        asset.content = content;
      }

      return merge(asset, {
        name: parsed.name + '.' + hash + parsed.ext,
        sri: sriAlgorithm + '-' + getHash(content, sriAlgorithm, 'base64')
      });
    });
  }
};

/**
 * Light wrapper to crypto.createHash.
 * @name getHash
 * @param {string} content
 * @param {string} algorithm
 * @param {string} output
 * @returns {string} hash
 */
const getHash = (content, algorithm, output) =>
  crypto.createHash(algorithm).update(content, 'utf8').digest(output);

module.exports = {
  getDistAssets: getDistAssets,
  getHash: getHash
};
