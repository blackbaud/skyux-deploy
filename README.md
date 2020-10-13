# skyux-deploy

[![npm](https://img.shields.io/npm/v/@blackbaud/skyux-deploy.svg)](https://www.npmjs.com/package/@blackbaud/skyux-deploy)
[![status](https://travis-ci.org/blackbaud/skyux-deploy.svg?branch=master)](https://travis-ci.org/blackbaud/skyux-deploy)

Deployment package for skyux apps.

## Install

`npm install -g @blackbaud/skyux-deploy`

## Usage

`skyux-deploy deploy` or `skyux-deploy publish`

## Options

All of the following options are required and overridable via the CLI.  For example, to set the name of the SPA the command would be:

`skyux-deploy --name MySPA`

| Option                  | Default |
| ----------------------- | ------- |
| `name`                  | `null` |
| `version`               | `version` property in `package.json` |
| `azureStorageAccount`   | `null`  |
| `azureStorageAccessKey` | `null`  |
| `azureStorageTableName` | "spa"   |
| `isStaticClient`        | `false` |
| `hashFileNames`         | `true`  |

`null` values are typically supplied by the CI process.
