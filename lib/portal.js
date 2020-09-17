'use strict';

const request = require('request');

const baseUrl = 'https://sky-pusa01.app.blackbaud.net/skysp/'

function sendRequest(method, url, sharedKey, spa) {
  return new Promise((resolve, reject) => {
    request(
      url,
      {
        method,
        headers: {
          'X-BB-Shared-Key': sharedKey
        },
        json: spa
      },
      (error, response) => {
        if (response && response.statusCode === 200) {
          resolve();
        } else {
          reject(error || response.body[0]);
        }
      }
    );
  });
}

/**
 * Deploys a SPA with the specified version.
 * @param {String} sharedKey
 * @param {Object} spa
 * @param {String} version
 */
function deploySpa(sharedKey, spa, version) {
  return sendRequest(
    'POST',
    `${baseUrl}spas/${encodeURIComponent(spa.name)}/versions/${encodeURIComponent(version)}`,
    sharedKey,
    spa
  );
}

/**
 * Marks a deployed SPA version as the production version.
 * @param {String} sharedKey
 * @param {Object} spa
 */
function publishSpa(sharedKey, spa) {
  return sendRequest(
    'PUT',
    `${baseUrl}spas/${encodeURIComponent(spa.name)}/release`,
    sharedKey,
    spa
  );
}

module.exports = {
  baseUrl,
  deploySpa,
  publishSpa
};
