# 1.9.0 (2020-10-09)

- Updated the `baseUrl` used in the `portal`. [#73](https://github.com/blackbaud/skyux-deploy/pull/73)

# 1.8.1 (2020-09-14)

- Updated the `content-type` used for JavaScript files from `application/x-javascript` to `application/javascript`. [#72](https://github.com/blackbaud/skyux-deploy/pull/72)

# 1.8.0 (2020-08-19)

- Updated the `deploy` command to upload assets in series instead of parallel. [#71](https://github.com/blackbaud/skyux-deploy/pull/71)

# 1.7.4 (2020-08-05)

- Fixed the `deploy` command to correctly exclude directories, even if they contain dots. [#70](https://github.com/blackbaud/skyux-deploy/pull/70)

# 1.7.3 (2020-03-25)

- Fixed the `deploy` command to correctly include versioned static assets. [#60](https://github.com/blackbaud/skyux-deploy/pull/60)
- Updated the version of `minimist`. [#61](https://github.com/blackbaud/skyux-deploy/pull/61)
- Updated the version of `acorn`. [#59](https://github.com/blackbaud/skyux-deploy/pull/59)

# 1.7.2 (2019-09-19)

- Fixed the `deploy` command to correctly log an error if no static assets are found. [#56](https://github.com/blackbaud/skyux-deploy/pull/56)

# 1.7.1 (2019-08-05)

- Fixed the `deploy` command to correctly deploy the major version of static assets. [#51](https://github.com/blackbaud/skyux-deploy/pull/51)

# 1.7.0 (2019-06-26)

- Updated the deploy command to always record the explicit version but maintain the major version for pre-releases. [#47](https://github.com/blackbaud/skyux-deploy/pull/47)

# 1.6.1 (2019-05-16)

- Display any errors caught during the `publish` command. [#45](https://github.com/blackbaud/skyux-deploy/pull/45)

# 1.6.0 (2019-05-16)

- Call the new deploy and publish endpoints provided by the SPA service rather than write directly to table storage. [#43](https://github.com/blackbaud/skyux-deploy/pull/43)

# 1.5.0 (2019-04-18)

- Updated dependencies. [#41](https://github.com/blackbaud/skyux-deploy/pull/41)

# 1.4.0 (2019-01-25)

- Added `size` property for each script stored in table storage. [#39](https://github.com/blackbaud/skyux-deploy/pull/39)

# 1.3.0 (2019-02-06)

- Added `isStaticClient` flag. [#31](https://github.com/blackbaud/skyux-deploy/pull/30) Thanks [@Blackbaud-TimPepper](https://github.com/Blackbaud-TimPepper)!

# 1.2.0 (2019-01-25)

- Removed ability to log SKY UX version. [#31](https://github.com/blackbaud/skyux-deploy/pull/31)

# 1.1.0 (2018-03-26)

- Migrated all logging to use `@blackbaud/skyux-logger` package. [#25](https://github.com/blackbaud/skyux-builder/pull/25)
- Bugfix for reading SKY UX version when using NPM 5. [#24](https://github.com/blackbaud/skyux-builder/pull/24)

# 1.0.0 (2017-10-03)

- Returning non-zero exit code if no assets are found during `deploy`. [#21](https://github.com/blackbaud/skyux-deploy/pull/21)

# 1.0.0-beta.5 (2017-06-02)

- Fixed bug parsing `JSON` files when BOM was present.
- If `deploy` or `release` step fails, return non-zero exit code.

# 1.0.0-beta.4 (2017-05-01)

- Uploading assets as block blobs instead of append blobs to Azure. 

# 1.0.0-beta.3 (2017-04-28)

- Adding missing `glob` dependency.

# 1.0.0-beta.2 (2017-04-28)

- Deploying any files in `dist/assets`. [#14](https://github.com/blackbaud/skyux-deploy/pull/14)

# 1.0.0-beta.1 (2017-01-13)

- Deploying `skyuxconfig.json` and `package.json` files.

# 1.0.0-beta.0 (2017-01-05)

- Initial release to NPM.
