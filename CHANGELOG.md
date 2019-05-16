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
