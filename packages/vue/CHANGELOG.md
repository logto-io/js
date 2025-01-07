# Change Log

## 3.0.4

### Patch Changes

- Updated dependencies [733e978]
  - @logto/browser@3.0.4

## 3.0.3

### Patch Changes

- 1fb33d0: force bump for republish
- Updated dependencies [1fb33d0]
  - @logto/browser@3.0.3

## 3.0.2

### Patch Changes

- @logto/browser@3.0.2

## 3.0.1

### Patch Changes

- 28bc32e: force bump for republish
- Updated dependencies [28bc32e]
  - @logto/browser@3.0.1

## 3.0.0

### Major Changes

- 9fa75c6: drop CommonJS support and become pure ESM

### Patch Changes

- Updated dependencies [9fa75c6]
  - @logto/browser@3.0.0

## 2.2.18

### Patch Changes

- @logto/browser@2.2.19

## 2.2.17

### Patch Changes

- @logto/browser@2.2.18

## 2.2.16

### Patch Changes

- @logto/browser@2.2.17

## 2.2.15

### Patch Changes

- 33f7c21: fix vue sdk sign-in method type infer
  - @logto/browser@2.2.16

## 2.2.14

### Patch Changes

- @logto/browser@2.2.15

## 2.2.13

### Patch Changes

- @logto/browser@2.2.14

## 2.2.12

### Patch Changes

- @logto/browser@2.2.13

## 2.2.11

### Patch Changes

- @logto/browser@2.2.12

## 2.2.10

### Patch Changes

- @logto/browser@2.2.11

## 2.2.9

### Patch Changes

- 3e28e29: add new method "clearAllTokens()" to clear all cached tokens from storage
  - @logto/browser@2.2.10

## 2.2.8

### Patch Changes

- bc86d46: export "clearAccessToken()" method from Client SDK
  - @logto/browser@2.2.9

## 2.2.7

### Patch Changes

- @logto/browser@2.2.8

## 2.2.6

### Patch Changes

- 24d1680: fix: clear access token storage on sign-in
- Updated dependencies [24d1680]
  - @logto/browser@2.2.7

## 2.2.5

### Patch Changes

- 76d113f: export more typescript types
- Updated dependencies [e0d20a3]
- Updated dependencies [76d113f]
  - @logto/browser@2.2.6

## 2.2.4

### Patch Changes

- @logto/browser@2.2.5

## 2.2.3

### Patch Changes

- @logto/browser@2.2.4

## 2.2.2

### Patch Changes

- 26619ed: use TypeScript 5.3.3
- Updated dependencies [26619ed]
  - @logto/browser@2.2.3

## 2.2.1

### Patch Changes

- 867b357: Add Node v20 LTS support
- Updated dependencies [867b357]
  - @logto/browser@2.2.2

## 2.2.0

### Minor Changes

- efdf5c5: Support organizations in Vue SDK

## 2.1.1

### Patch Changes

- bump `@logto/browser` version

## 2.1.0

### Minor Changes

- 9225576: export useful members from dependency sdk packages

### Patch Changes

- Updated dependencies [8d693a3]
  - @logto/browser@2.2.0

## 2.0.3

### Patch Changes

- f9ff6f4: Align the js SDK error type exports.

  - @logto/react: add `LogtoRequestError` export
  - @logto/vue: add `LogtoRequestError` export
  - @logto/express: add logto errors export
  - @logto/next: add logto errors export

- Updated dependencies [f9ff6f4]
  - @logto/browser@2.1.2

## 2.0.2

### Patch Changes

- fbdcb0b: Fix potential infinite loop when handling sign-in callback in React and Vue SDKs

## 2.0.1

### Patch Changes

- 922d385: Fixed a potential infinite loop in React and Vue SDKs in some edge cases

## 2.0.0

### Major Changes

- 3aa0913: set package type to ESM, keep CJS build for compatibility (#477)

### Patch Changes

- 0839bf1: Fix potential issue on handling sign-in callback in React and Vue SDKs
- Updated dependencies [3aa0913]
  - @logto/browser@2.0.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [1.1.2](https://github.com/logto-io/js/compare/v1.1.1...v1.1.2) (2023-04-24)

**Note:** Version bump only for package @logto/vue

### [1.1.1](https://github.com/logto-io/js/compare/v1.1.0...v1.1.1) (2023-04-11)

### Bug Fixes

- **vue,vue-sample:** remove the mis-use of watchEffect ([4fb5415](https://github.com/logto-io/js/commit/4fb5415f168ef39abc447a9a5980dbc7256dd18d))

## [1.1.0](https://github.com/logto-io/js/compare/v1.0.0...v1.1.0) (2023-03-19)

### Features

- **js:** add interactionMode props to signIn method ([ea763a5](https://github.com/logto-io/js/commit/ea763a59e41251ffad4089df0d6bb876e9901109))

## [1.0.0](https://github.com/logto-io/js/compare/v1.0.0-rc.0...v1.0.0) (2023-02-28)

**Note:** Version bump only for package @logto/vue

## [1.0.0-rc.0](https://github.com/logto-io/js/compare/v1.0.0-beta.15...v1.0.0-rc.0) (2023-02-03)

**Note:** Version bump only for package @logto/vue

## [1.0.0-beta.15](https://github.com/logto-io/js/compare/v1.0.0-beta.14...v1.0.0-beta.15) (2023-01-12)

**Note:** Version bump only for package @logto/vue

## [1.0.0-beta.14](https://github.com/logto-io/js/compare/v1.0.0-beta.13...v1.0.0-beta.14) (2022-12-12)

**Note:** Version bump only for package @logto/vue

## [1.0.0-beta.13](https://github.com/logto-io/js/compare/v1.0.0-beta.12...v1.0.0-beta.13) (2022-11-08)

### Bug Fixes

- use `.mjs` for ESM files ([#429](https://github.com/logto-io/js/issues/429)) ([2993007](https://github.com/logto-io/js/commit/2993007a0dac3c9ed79e2415fcc55059d2d7a494))

## [1.0.0-beta.12](https://github.com/logto-io/js/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2022-11-02)

**Note:** Version bump only for package @logto/vue

## [1.0.0-beta.11](https://github.com/logto-io/js/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2022-10-26)

**Note:** Version bump only for package @logto/vue

## [1.0.0-beta.10](https://github.com/logto-io/js/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2022-10-21)

**Note:** Version bump only for package @logto/vue

## [1.0.0-beta.9](https://github.com/logto-io/js/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2022-10-19)

**Note:** Version bump only for package @logto/vue

## [1.0.0-beta.8](https://github.com/logto-io/js/compare/v1.0.0-beta.7...v1.0.0-beta.8) (2022-09-23)

**Note:** Version bump only for package @logto/vue

## [1.0.0-beta.7](https://github.com/logto-io/js/compare/v1.0.0-beta.6...v1.0.0-beta.7) (2022-09-20)

**Note:** Version bump only for package @logto/vue

## [1.0.0-beta.6](https://github.com/logto-io/js/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2022-09-17)

### Features

- **browser,react,vue:** enable userinfo endpoint ([cae6eff](https://github.com/logto-io/js/commit/cae6effd1b75b31627b896e210f6acda46faedeb))

## [1.0.0-beta.5](https://github.com/logto-io/js/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2022-09-13)

### Bug Fixes

- **react,vue:** do not set loading to false after calling signIn ([#403](https://github.com/logto-io/js/issues/403)) ([06b6060](https://github.com/logto-io/js/commit/06b6060c22e927c05545310a09ca080a55e89ec7))

## [1.0.0-beta.4](https://github.com/logto-io/js/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2022-09-09)

### Bug Fixes

- **react,vue:** fix mis-handled isAuthenticated state in react and vue sdks ([9fe790d](https://github.com/logto-io/js/commit/9fe790d0057e50ab07448465d1f6875fe2e4523f))

## [1.0.0-beta.3](https://github.com/logto-io/js/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2022-08-22)

**Note:** Version bump only for package @logto/vue

## [1.0.0-beta.2](https://github.com/logto-io/js/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2022-08-08)

**Note:** Version bump only for package @logto/vue

## [1.0.0-beta.0](https://github.com/logto-io/js/compare/v1.0.0-alpha.3...v1.0.0-beta.0) (2022-07-21)

**Note:** Version bump only for package @logto/vue

## [1.0.0-alpha.3](https://github.com/logto-io/js/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2022-07-08)

**Note:** Version bump only for package @logto/vue

## [1.0.0-alpha.2](https://github.com/logto-io/js/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2022-07-08)

**Note:** Version bump only for package @logto/vue

## [1.0.0-alpha.1](https://github.com/logto-io/js/compare/v1.0.0-alpha.0...v1.0.0-alpha.1) (2022-07-07)

**Note:** Version bump only for package @logto/vue

## [1.0.0-alpha.0](https://github.com/logto-io/js/compare/v0.2.2...v1.0.0-alpha.0) (2022-07-07)

### Bug Fixes

- packing ([#321](https://github.com/logto-io/js/issues/321)) ([c808005](https://github.com/logto-io/js/commit/c8080058fa1861c02f264a0d8db568c0292d3d7f))

### [0.2.2](https://github.com/logto-io/js/compare/v0.2.1...v0.2.2) (2022-06-30)

**Note:** Version bump only for package @logto/vue

### [0.2.1](https://github.com/logto-io/js/compare/v0.2.0...v0.2.1) (2022-06-30)

**Note:** Version bump only for package @logto/vue

## [0.2.0](https://github.com/logto-io/js/compare/v0.1.18...v0.2.0) (2022-06-30)

### Features

- remove userinfo ([#317](https://github.com/logto-io/js/issues/317)) ([3f9d412](https://github.com/logto-io/js/commit/3f9d412cb2ec930fe036c8ad9c7d1568498581e8))

### [0.1.18](https://github.com/logto-io/js/compare/v0.1.17...v0.1.18) (2022-06-29)

**Note:** Version bump only for package @logto/vue

### [0.1.17](https://github.com/logto-io/js/compare/v0.1.16...v0.1.17) (2022-06-29)

**Note:** Version bump only for package @logto/vue

### [0.1.16](https://github.com/logto-io/js/compare/v0.1.15...v0.1.16) (2022-06-14)

**Note:** Version bump only for package @logto/vue

### [0.1.15](https://github.com/logto-io/js/compare/v0.1.14...v0.1.15) (2022-06-08)

**Note:** Version bump only for package @logto/vue

### [0.1.14](https://github.com/logto-io/js/compare/v0.1.13...v0.1.14) (2022-06-02)

**Note:** Version bump only for package @logto/vue

### [0.1.13](https://github.com/logto-io/js/compare/v0.1.12...v0.1.13) (2022-06-01)

**Note:** Version bump only for package @logto/vue

### [0.1.12](https://github.com/logto-io/js/compare/v0.1.11...v0.1.12) (2022-05-31)

**Note:** Version bump only for package @logto/vue

### [0.1.11](https://github.com/logto-io/js/compare/v0.1.10...v0.1.11) (2022-05-28)

**Note:** Version bump only for package @logto/vue

### [0.1.10](https://github.com/logto-io/js/compare/v0.1.9...v0.1.10) (2022-05-28)

**Note:** Version bump only for package @logto/vue

### [0.1.9](https://github.com/logto-io/js/compare/v0.1.8...v0.1.9) (2022-05-27)

### Bug Fixes

- 'LogtoClientError' should be exported as class instead of type ([85fc983](https://github.com/logto-io/js/commit/85fc98346ce336ebd58ba61e0cbd3d127b814a13))

### [0.1.8](https://github.com/logto-io/js/compare/v0.1.7...v0.1.8) (2022-05-27)

### Features

- **vue:** create vue sdk ([6a68267](https://github.com/logto-io/js/commit/6a68267ff8c86bdde22050f351b95afae63753e2))
