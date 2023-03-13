'use strict';

const crypto = require('crypto');
const fs = require('fs-extra');
const merge = require('merge');
const path = require('path');
const glob = require('glob');
const utils = require('./utils');

const cwd = process.cwd();
const dist = path.join(cwd, 'dist');
const bundles = path.join(dist, 'bundles');
const sriAlgorithm = 'sha384';
const readOptions = { encoding: 'utf8' };

function formatEmittedAsset(asset, isStaticClient, version) {
  let name = asset.substring(dist.length + 1);

  if (isStaticClient) {
    name = path.join(version, name);
  }

  return {
    name,
    file: asset,
  };
}

/**
 * Returns an array of emitted assets (images).
 * @name getEmittedAssets
 * @returns {Array} assets
 */
function getEmittedAssets(isStaticClient, version, assetsGlob) {
  // Directories with dots would otherwise match this pattern without `nodir`.
  const globbedAssets = glob.sync(path.join(dist, assetsGlob), {
    nodir: true,
  });

  let emittedAssets = globbedAssets.map((asset) =>
    formatEmittedAsset(asset, isStaticClient, version)
  );

  // Add emitted assets as majorVersions too
  if (isStaticClient) {
    const majorVersion = utils.getValidMajorVersion(version);
    if (majorVersion) {
      emittedAssets = emittedAssets.concat(
        globbedAssets.map((asset) =>
          formatEmittedAsset(asset, isStaticClient, majorVersion)
        )
      );
    }
  }

  return emittedAssets;
}

const getStaticAssets = (includeContent, isStaticClient, version) =>
  glob.sync(path.join(bundles, '*.js')).map((bundle) =>
    formatAssets(includeContent, isStaticClient, {
      name: path.basename(bundle),
      version,
    })
  );

/**
 * Returns an array of assets (files + metadata).
 * @name getDistAssets
 * @param {boolean} includeContent
 * @param {boolean} isStaticClient
 * @returns {Array} assets
 */
const getDistAssets = (
  includeContent,
  isStaticClient,
  version,
  hashFileNames
) => {
  let metadataPath = path.join(dist, 'metadata.json');

  if (isStaticClient) {
    const assets = getStaticAssets(includeContent, isStaticClient, version);
    const versionMajor = utils.getValidMajorVersion(version);

    // Add the major version assets
    if (versionMajor) {
      return assets.concat(
        getStaticAssets(includeContent, isStaticClient, versionMajor)
      );
    }

    return assets;
  }

  if (fs.existsSync(metadataPath)) {
    const metadata = require(metadataPath);
    return metadata.map((asset) =>
      formatAssets(includeContent, isStaticClient, asset, hashFileNames)
    );
  }

  return [];
};

/**
 * Formats individual assets
 * @name formatAssets
 * @param {boolean} includeContent
 * @param {boolean} isStaticClient
 * @param {object} asset
 * @param {boolean} hashFileNames
 * @returns {object} asset
 */
const formatAssets = (
  includeContent,
  isStaticClient,
  asset,
  hashFileNames = true
) => {
  const parsed = path.parse(asset.name);
  const assetPathRoot = isStaticClient ? bundles : dist;
  const assetPath = path.join(assetPathRoot, asset.name);
  const stats = fs.statSync(assetPath);
  const content = fs.readFileSync(assetPath, readOptions);
  const hash = getHash(content, 'md5', 'hex');

  let name;

  if (isStaticClient) {
    name = asset.version + '/' + parsed.base;
  } else {
    name = hashFileNames ? `${parsed.name}.${hash}${parsed.ext}` : asset.name;
  }

  const props = {
    name: name,
    size: stats.size,
    sri: sriAlgorithm + '-' + getHash(content, sriAlgorithm, 'base64'),
  };

  if (includeContent) {
    props.content = content;
  }

  props.type = asset.type || 'script';

  return merge({}, asset, props);
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
  getEmittedAssets: getEmittedAssets,
  getHash: getHash,
};
