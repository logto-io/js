# Change Log

## 3.0.6

### Patch Changes

- @logto/node@3.1.2

## 3.0.5

### Patch Changes

- d6a900c: bump dependencies for security update
- Updated dependencies [d6a900c]
  - @logto/node@3.1.1

## 3.0.4

### Patch Changes

- Updated dependencies [8c352b5]
  - @logto/node@3.1.0

## 3.0.3

### Patch Changes

- 1fb33d0: force bump for republish
- Updated dependencies [1fb33d0]
  - @logto/node@3.0.3

## 3.0.2

### Patch Changes

- @logto/node@3.0.2

## 3.0.1

### Patch Changes

- 28bc32e: force bump for republish
- Updated dependencies [28bc32e]
  - @logto/node@3.0.1

## 3.0.0

### Major Changes

- 9fa75c6: drop CommonJS support and become pure ESM

### Patch Changes

- Updated dependencies [9fa75c6]
  - @logto/node@3.0.0

## 2.4.0

### Minor Changes

- 09c5bf9: support sign in options

  Add new option `signInOptions`, see https://docs.logto.io/docs/references/openid-connect/authentication-parameters for more details.

### Patch Changes

- @logto/node@2.5.9

## 2.3.17

### Patch Changes

- Updated dependencies [8d0b058]
  - @logto/node@2.5.8

## 2.3.16

### Patch Changes

- @logto/node@2.5.7

## 2.3.15

### Patch Changes

- @logto/node@2.5.6

## 2.3.14

### Patch Changes

- 5f64e0e: export `UserInfoResponse` type
  - @logto/node@2.5.5

## 2.3.13

### Patch Changes

- @logto/node@2.5.4

## 2.3.12

### Patch Changes

- @logto/node@2.5.3

## 2.3.11

### Patch Changes

- @logto/node@2.5.2

## 2.3.10

### Patch Changes

- @logto/node@2.5.1

## 2.3.9

### Patch Changes

- Updated dependencies [957a1c9]
  - @logto/node@2.5.0

## 2.3.8

### Patch Changes

- @logto/node@2.4.7

## 2.3.7

### Patch Changes

- @logto/node@2.4.6

## 2.3.6

### Patch Changes

- @logto/node@2.4.5

## 2.3.5

### Patch Changes

- 24d1680: fix: clear access token storage on sign-in
- Updated dependencies [24d1680]
  - @logto/node@2.4.4

## 2.3.4

### Patch Changes

- 76d113f: export more typescript types
- Updated dependencies [76d113f]
  - @logto/node@2.4.3

## 2.3.3

### Patch Changes

- @logto/node@2.4.2

## 2.3.2

### Patch Changes

- @logto/node@2.4.1

## 2.3.1

### Patch Changes

- 26619ed: use TypeScript 5.3.3
- Updated dependencies [88495b2]
- Updated dependencies [864caab]
- Updated dependencies [864caab]
- Updated dependencies [26619ed]
  - @logto/node@2.4.0

## 2.3.0

### Minor Changes

- d635a10: Add organization support

### Patch Changes

- Updated dependencies [d635a10]
- Updated dependencies [867b357]
  - @logto/node@2.3.0

## 2.2.0

### Minor Changes

- 9225576: export useful members from dependency sdk packages

### Patch Changes

- Updated dependencies [9225576]
  - @logto/node@2.2.0

## 2.1.1

### Patch Changes

- f9ff6f4: Align the js SDK error type exports.

  - @logto/react: add `LogtoRequestError` export
  - @logto/vue: add `LogtoRequestError` export
  - @logto/express: add logto errors export
  - @logto/next: add logto errors export

- Updated dependencies [f9ff6f4]
  - @logto/node@2.1.2

## 2.1.0

### Minor Changes

- 27f6a53: Support custom auth routes prefix

## 2.0.2

### Patch Changes

- 90ef48f: add well-known cache support (unstable)

  - client: support `unstable_cache` in `ClientAdapter`
  - browser, react: add `unstable_enableCache` option to enable a `sessionStorage` cache for well-known data

## 2.0.1

### Patch Changes

- 77480ae: Skip token decode for opaque access token
- Updated dependencies [77480ae]
  - @logto/node@2.1.1

## 2.0.0

### Major Changes

- 3aa0913: set package type to ESM, keep CJS build for compatibility (#477)

### Patch Changes

- Updated dependencies [3aa0913]
  - @logto/node@2.0.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [1.1.2](https://github.com/logto-io/js/compare/v1.1.1...v1.1.2) (2023-04-24)

**Note:** Version bump only for package @logto/express

### [1.1.1](https://github.com/logto-io/js/compare/v1.1.0...v1.1.1) (2023-04-11)

**Note:** Version bump only for package @logto/express

## [1.1.0](https://github.com/logto-io/js/compare/v1.0.0...v1.1.0) (2023-03-19)

### Features

- **js:** add interactionMode props to signIn method ([ea763a5](https://github.com/logto-io/js/commit/ea763a59e41251ffad4089df0d6bb876e9901109))

## [1.0.0](https://github.com/logto-io/js/compare/v1.0.0-rc.0...v1.0.0) (2023-02-28)

**Note:** Version bump only for package @logto/express

## [1.0.0-rc.0](https://github.com/logto-io/js/compare/v1.0.0-beta.15...v1.0.0-rc.0) (2023-02-03)

### Bug Fixes

- remove core-kit dependency and update `engines` ([8a24a87](https://github.com/logto-io/js/commit/8a24a870e7b3891f5e205b3e8a9419535baa7b44))

## [1.0.0-beta.15](https://github.com/logto-io/js/compare/v1.0.0-beta.14...v1.0.0-beta.15) (2023-01-12)

**Note:** Version bump only for package @logto/express

## [1.0.0-beta.14](https://github.com/logto-io/js/compare/v1.0.0-beta.13...v1.0.0-beta.14) (2022-12-12)

**Note:** Version bump only for package @logto/express

## [1.0.0-beta.13](https://github.com/logto-io/js/compare/v1.0.0-beta.12...v1.0.0-beta.13) (2022-11-08)

### Bug Fixes

- use `.mjs` for ESM files ([#429](https://github.com/logto-io/js/issues/429)) ([2993007](https://github.com/logto-io/js/commit/2993007a0dac3c9ed79e2415fcc55059d2d7a494))

## [1.0.0-beta.12](https://github.com/logto-io/js/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2022-11-02)

**Note:** Version bump only for package @logto/express

## [1.0.0-beta.11](https://github.com/logto-io/js/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2022-10-26)

### Features

- **node,next,express:** get access token with resource ([#420](https://github.com/logto-io/js/issues/420)) ([6fb22ea](https://github.com/logto-io/js/commit/6fb22ea51a50c7a8b1b64cb6d2aa665c18b3a0b8))

## [1.0.0-beta.10](https://github.com/logto-io/js/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2022-10-21)

**Note:** Version bump only for package @logto/express

## [1.0.0-beta.9](https://github.com/logto-io/js/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2022-10-19)

### Features

- **express,next,node:** support fetchUserInfo ([#413](https://github.com/logto-io/js/issues/413)) ([91431d0](https://github.com/logto-io/js/commit/91431d0328d95654928ee86db883884b85120af5))

## [1.0.0-beta.8](https://github.com/logto-io/js/compare/v1.0.0-beta.7...v1.0.0-beta.8) (2022-09-23)

**Note:** Version bump only for package @logto/express

## [1.0.0-beta.7](https://github.com/logto-io/js/compare/v1.0.0-beta.6...v1.0.0-beta.7) (2022-09-20)

### Bug Fixes

- remove persist access token ([#406](https://github.com/logto-io/js/issues/406)) ([f2ba84f](https://github.com/logto-io/js/commit/f2ba84f07e8486e2edf6f35e06446738ea0158e7))

## [1.0.0-beta.6](https://github.com/logto-io/js/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2022-09-17)

**Note:** Version bump only for package @logto/express

## [1.0.0-beta.5](https://github.com/logto-io/js/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2022-09-13)

**Note:** Version bump only for package @logto/express

## [1.0.0-beta.4](https://github.com/logto-io/js/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2022-09-09)

**Note:** Version bump only for package @logto/express

## [1.0.0-beta.3](https://github.com/logto-io/js/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2022-08-22)

**Note:** Version bump only for package @logto/express

## [1.0.0-beta.2](https://github.com/logto-io/js/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2022-08-08)

### Features

- **express:** init express and add routes handler ([#375](https://github.com/logto-io/js/issues/375)) ([5fbfc1b](https://github.com/logto-io/js/commit/5fbfc1b7c80660706562a36c7a90c0f7b52fd10e))
- **express:** with logto ([#378](https://github.com/logto-io/js/issues/378)) ([9626b76](https://github.com/logto-io/js/commit/9626b764eb84287a1e29783a768f33190d28411d))
