# Change Log

## 4.0.4

### Patch Changes

- Updated dependencies [733e978]
  - @logto/browser@3.0.4

## 4.0.3

### Patch Changes

- 1fb33d0: force bump for republish
- Updated dependencies [1fb33d0]
  - @logto/browser@3.0.3

## 4.0.2

### Patch Changes

- @logto/browser@3.0.2

## 4.0.1

### Patch Changes

- 28bc32e: force bump for republish
- Updated dependencies [28bc32e]
  - @logto/browser@3.0.1

## 4.0.0

### Major Changes

- 9fa75c6: drop CommonJS support and become pure ESM

### Patch Changes

- Updated dependencies [9fa75c6]
  - @logto/browser@3.0.0

## 3.0.17

### Patch Changes

- @logto/browser@2.2.19

## 3.0.16

### Patch Changes

- @logto/browser@2.2.18

## 3.0.15

### Patch Changes

- @logto/browser@2.2.17

## 3.0.14

### Patch Changes

- @logto/browser@2.2.16

## 3.0.13

### Patch Changes

- @logto/browser@2.2.15

## 3.0.12

### Patch Changes

- @logto/browser@2.2.14

## 3.0.11

### Patch Changes

- @logto/browser@2.2.13

## 3.0.10

### Patch Changes

- @logto/browser@2.2.12

## 3.0.9

### Patch Changes

- @logto/browser@2.2.11

## 3.0.8

### Patch Changes

- 3e28e29: add new method "clearAllTokens()" to clear all cached tokens from storage
  - @logto/browser@2.2.10

## 3.0.7

### Patch Changes

- bc86d46: export "clearAccessToken()" method from Client SDK
  - @logto/browser@2.2.9

## 3.0.6

### Patch Changes

- @logto/browser@2.2.8

## 3.0.5

### Patch Changes

- 24d1680: fix: clear access token storage on sign-in
- Updated dependencies [24d1680]
  - @logto/browser@2.2.7

## 3.0.4

### Patch Changes

- 76d113f: export more typescript types
- e0d20a3: allow overriding `LogtoClient` class for `LogtoProvider`
- Updated dependencies [e0d20a3]
- Updated dependencies [76d113f]
  - @logto/browser@2.2.6

## 3.0.3

### Patch Changes

- e6c8ec5: fix `signIn()` type

  Now it can correctly infer the overload signatures.

  - @logto/browser@2.2.5

## 3.0.2

### Patch Changes

- @logto/browser@2.2.4

## 3.0.1

### Patch Changes

- cf96cb8: for bump version to publish the package

## 3.0.0

### Major Changes

- 204cdcd: refactor LogtoContextProps and LogtoContext

  This version marks as major because it changes the exported `LogtoContextProps` type. In most cases, this should not affect you.

  - Removed `loadingCount` and `setLoadingCount` from `LogtoContextProps`.
  - Added `isLoading` and `setIsLoading` to `LogtoContextProps`.
  - Export `LogtoContext`.

### Patch Changes

- 26619ed: use TypeScript 5.3.3
- Updated dependencies [26619ed]
  - @logto/browser@2.2.3

## 2.2.4

### Patch Changes

- 867b357: Add Node v20 LTS support
- Updated dependencies [867b357]
  - @logto/browser@2.2.2

## 2.2.3

### Patch Changes

- bump `@logto/browser` version

## 2.2.2

### Patch Changes

- 3a0713d: refactor `useHandleSignInCallback()`

  - check `isLoading` and `error` before calling the client callback handler to prevent unnecessary calls (e.g. in React strict mode)

## 2.2.1

### Patch Changes

- 46b3662: memorize hook methods to reduce unnecessary updates

## 2.2.0

### Minor Changes

- 8d693a3: export useful members from dependency sdk packages
- 8d693a3: add organizations support

  - `useLogto()` now exports `getOrganizationToken()` and `getOrganizationTokenClaims()`
  - `useLogto()` also exports `getRefreshToken()`, `getAccessTokenClaims()`, and `getIdToken()`

### Patch Changes

- Updated dependencies [8d693a3]
  - @logto/browser@2.2.0

## 2.1.2

### Patch Changes

- f9ff6f4: Align the js SDK error type exports.

  - @logto/react: add `LogtoRequestError` export
  - @logto/vue: add `LogtoRequestError` export
  - @logto/express: add logto errors export
  - @logto/next: add logto errors export

- Updated dependencies [f9ff6f4]
  - @logto/browser@2.1.2

## 2.1.1

### Patch Changes

- fbdcb0b: Fix potential infinite loop when handling sign-in callback in React and Vue SDKs

## 2.1.0

### Minor Changes

- 90ef48f: add well-known cache support (unstable)

  - client: support `unstable_cache` in `ClientAdapter`
  - browser, react: add `unstable_enableCache` option to enable a `sessionStorage` cache for well-known data

### Patch Changes

- Updated dependencies [90ef48f]
  - @logto/browser@2.1.0

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

### Bug Fixes

- **react:** only call handleSignInCallback when not loading ([df6efe1](https://github.com/logto-io/js/commit/df6efe1fd007c3aa67a98bae4b19a7cc47c22cdb))
- test case ([3a01748](https://github.com/logto-io/js/commit/3a017482e63389809a05468b5dcecc7294eea92b))

### [1.1.1](https://github.com/logto-io/js/compare/v1.1.0...v1.1.1) (2023-04-11)

**Note:** Version bump only for package @logto/react

## [1.1.0](https://github.com/logto-io/js/compare/v1.0.0...v1.1.0) (2023-03-19)

### Features

- **js:** add interactionMode props to signIn method ([ea763a5](https://github.com/logto-io/js/commit/ea763a59e41251ffad4089df0d6bb876e9901109))

## [1.0.0](https://github.com/logto-io/js/compare/v1.0.0-rc.0...v1.0.0) (2023-02-28)

**Note:** Version bump only for package @logto/react

## [1.0.0-rc.0](https://github.com/logto-io/js/compare/v1.0.0-beta.15...v1.0.0-rc.0) (2023-02-03)

**Note:** Version bump only for package @logto/react

## [1.0.0-beta.15](https://github.com/logto-io/js/compare/v1.0.0-beta.14...v1.0.0-beta.15) (2023-01-12)

**Note:** Version bump only for package @logto/react

## [1.0.0-beta.14](https://github.com/logto-io/js/compare/v1.0.0-beta.13...v1.0.0-beta.14) (2022-12-12)

**Note:** Version bump only for package @logto/react

## [1.0.0-beta.13](https://github.com/logto-io/js/compare/v1.0.0-beta.12...v1.0.0-beta.13) (2022-11-08)

### Bug Fixes

- use `.mjs` for ESM files ([#429](https://github.com/logto-io/js/issues/429)) ([2993007](https://github.com/logto-io/js/commit/2993007a0dac3c9ed79e2415fcc55059d2d7a494))

## [1.0.0-beta.12](https://github.com/logto-io/js/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2022-11-02)

**Note:** Version bump only for package @logto/react

## [1.0.0-beta.11](https://github.com/logto-io/js/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2022-10-26)

**Note:** Version bump only for package @logto/react

## [1.0.0-beta.10](https://github.com/logto-io/js/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2022-10-21)

**Note:** Version bump only for package @logto/react

## [1.0.0-beta.9](https://github.com/logto-io/js/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2022-10-19)

**Note:** Version bump only for package @logto/react

## [1.0.0-beta.8](https://github.com/logto-io/js/compare/v1.0.0-beta.7...v1.0.0-beta.8) (2022-09-23)

**Note:** Version bump only for package @logto/react

## [1.0.0-beta.7](https://github.com/logto-io/js/compare/v1.0.0-beta.6...v1.0.0-beta.7) (2022-09-20)

**Note:** Version bump only for package @logto/react

## [1.0.0-beta.6](https://github.com/logto-io/js/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2022-09-17)

### Features

- **browser,react,vue:** enable userinfo endpoint ([cae6eff](https://github.com/logto-io/js/commit/cae6effd1b75b31627b896e210f6acda46faedeb))

### Bug Fixes

- bump to essentials v1.2.1 to use utf-8 on decoding base64 ([5a4ad09](https://github.com/logto-io/js/commit/5a4ad093e14ffa4927a09f4f692c0c26f412b7c0))

## [1.0.0-beta.5](https://github.com/logto-io/js/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2022-09-13)

### Bug Fixes

- **react,vue:** do not set loading to false after calling signIn ([#403](https://github.com/logto-io/js/issues/403)) ([06b6060](https://github.com/logto-io/js/commit/06b6060c22e927c05545310a09ca080a55e89ec7))

## [1.0.0-beta.4](https://github.com/logto-io/js/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2022-09-09)

### Bug Fixes

- **react,vue:** fix mis-handled isAuthenticated state in react and vue sdks ([9fe790d](https://github.com/logto-io/js/commit/9fe790d0057e50ab07448465d1f6875fe2e4523f))

## [1.0.0-beta.3](https://github.com/logto-io/js/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2022-08-22)

**Note:** Version bump only for package @logto/react

## [1.0.0-beta.2](https://github.com/logto-io/js/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2022-08-08)

**Note:** Version bump only for package @logto/react

## [1.0.0-beta.0](https://github.com/logto-io/js/compare/v1.0.0-alpha.3...v1.0.0-beta.0) (2022-07-21)

**Note:** Version bump only for package @logto/react

## [1.0.0-alpha.3](https://github.com/logto-io/js/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2022-07-08)

**Note:** Version bump only for package @logto/react

## [1.0.0-alpha.2](https://github.com/logto-io/js/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2022-07-08)

**Note:** Version bump only for package @logto/react

## [1.0.0-alpha.1](https://github.com/logto-io/js/compare/v1.0.0-alpha.0...v1.0.0-alpha.1) (2022-07-07)

**Note:** Version bump only for package @logto/react

## [1.0.0-alpha.0](https://github.com/logto-io/js/compare/v0.2.2...v1.0.0-alpha.0) (2022-07-07)

### Bug Fixes

- packing ([#321](https://github.com/logto-io/js/issues/321)) ([c808005](https://github.com/logto-io/js/commit/c8080058fa1861c02f264a0d8db568c0292d3d7f))

### [0.2.2](https://github.com/logto-io/js/compare/v0.2.1...v0.2.2) (2022-06-30)

**Note:** Version bump only for package @logto/react

### [0.2.1](https://github.com/logto-io/js/compare/v0.2.0...v0.2.1) (2022-06-30)

**Note:** Version bump only for package @logto/react

## [0.2.0](https://github.com/logto-io/js/compare/v0.1.18...v0.2.0) (2022-06-30)

### Features

- remove userinfo ([#317](https://github.com/logto-io/js/issues/317)) ([3f9d412](https://github.com/logto-io/js/commit/3f9d412cb2ec930fe036c8ad9c7d1568498581e8))

### [0.1.18](https://github.com/logto-io/js/compare/v0.1.17...v0.1.18) (2022-06-29)

**Note:** Version bump only for package @logto/react

### [0.1.17](https://github.com/logto-io/js/compare/v0.1.16...v0.1.17) (2022-06-29)

**Note:** Version bump only for package @logto/react

### [0.1.16](https://github.com/logto-io/js/compare/v0.1.15...v0.1.16) (2022-06-14)

**Note:** Version bump only for package @logto/react

### [0.1.15](https://github.com/logto-io/js/compare/v0.1.14...v0.1.15) (2022-06-08)

**Note:** Version bump only for package @logto/react

### [0.1.14](https://github.com/logto-io/js/compare/v0.1.13...v0.1.14) (2022-06-02)

**Note:** Version bump only for package @logto/react

### [0.1.13](https://github.com/logto-io/js/compare/v0.1.12...v0.1.13) (2022-06-01)

**Note:** Version bump only for package @logto/react

### [0.1.12](https://github.com/logto-io/js/compare/v0.1.11...v0.1.12) (2022-05-31)

### Bug Fixes

- **react:** calling getIdTokenClaims will not cause infinite loop ([10a5caa](https://github.com/logto-io/js/commit/10a5caad9a7f90c93f8251fef60d94bb088a4e59))

### [0.1.11](https://github.com/logto-io/js/compare/v0.1.10...v0.1.11) (2022-05-28)

**Note:** Version bump only for package @logto/react

### [0.1.10](https://github.com/logto-io/js/compare/v0.1.9...v0.1.10) (2022-05-28)

**Note:** Version bump only for package @logto/react

### [0.1.9](https://github.com/logto-io/js/compare/v0.1.8...v0.1.9) (2022-05-27)

### Bug Fixes

- 'LogtoClientError' should be exported as class instead of type ([85fc983](https://github.com/logto-io/js/commit/85fc98346ce336ebd58ba61e0cbd3d127b814a13))

### [0.1.8](https://github.com/logto-io/js/compare/v0.1.7...v0.1.8) (2022-05-27)

**Note:** Version bump only for package @logto/react

### [0.1.7](https://github.com/logto-io/js/compare/v0.1.6...v0.1.7) (2022-05-17)

**Note:** Version bump only for package @logto/react

### [0.1.6](https://github.com/logto-io/js/compare/v0.1.5...v0.1.6) (2022-05-17)

### Features

- **react:** add error prop to useLogto context ([ebe9e96](https://github.com/logto-io/js/commit/ebe9e962d65fa547d5a6349b2beb99b35e50dfe0))

### [0.1.5](https://github.com/logto-io/js/compare/v0.1.4...v0.1.5) (2022-05-05)

### Bug Fixes

- leverage root `prepack` lifecycle for publish ([#235](https://github.com/logto-io/js/issues/235)) ([8e66d82](https://github.com/logto-io/js/commit/8e66d82dacd204c32ffc39f4440b47e0f7541cc3))

### [0.1.4](https://github.com/logto-io/js/compare/v0.1.3...v0.1.4) (2022-03-18)

**Note:** Version bump only for package @logto/react

### [0.1.3](https://github.com/logto-io/js/compare/v0.1.2...v0.1.3) (2022-03-16)

**Note:** Version bump only for package @logto/react

### [0.1.2](https://github.com/logto-io/js/compare/v0.1.2-rc.1...v0.1.2) (2022-03-10)

**Note:** Version bump only for package @logto/react

### [0.1.2-rc.1](https://github.com/logto-io/js/compare/v0.1.2-rc.0...v0.1.2-rc.1) (2022-03-10)

**Note:** Version bump only for package @logto/react

### [0.1.2-rc.0](https://github.com/logto-io/js/compare/v0.1.1-rc.0...v0.1.2-rc.0) (2022-03-10)

### Bug Fixes

- remove `prepublish` script ([#221](https://github.com/logto-io/js/issues/221)) ([cc89533](https://github.com/logto-io/js/commit/cc895337762cf7740578a8eb14835ed0d5d72905))

### [0.1.1-rc.0](https://github.com/logto-io/js/compare/v0.1.0...v0.1.1-rc.0) (2022-03-10)

### Bug Fixes

- add `publishConfig` to packages ([a809e25](https://github.com/logto-io/js/commit/a809e257982f7d3c31f104fa5daf983c535adfc5))

## 0.1.0 (2022-03-10)

### Features

- **lint:** add lint-stage to all packages ([1289e3e](https://github.com/logto-io/js/commit/1289e3e11896d4fc68bb465d94d52f7cc4e90064))
- protected route ([#84](https://github.com/logto-io/js/issues/84)) ([d28db7c](https://github.com/logto-io/js/commit/d28db7c98fe596a31013bda51645b129b3d0bda9))
- **react-playground:** implement react-playground ([897911d](https://github.com/logto-io/js/commit/897911dcdbd2a574374f0eb5794ac4684ec06859))
- **react-playground:** make encrypted user login info in url invisible ([#109](https://github.com/logto-io/js/issues/109)) ([13df814](https://github.com/logto-io/js/commit/13df8142d8e318a5782ec35d6661f76326b85766))
- **react-sdk:** update react sdk ([951d316](https://github.com/logto-io/js/commit/951d316fc6efae955b0e79a0a7cc8f80bfe91bce))
- **react:** auto handle callback ([#92](https://github.com/logto-io/js/issues/92)) ([58ee454](https://github.com/logto-io/js/commit/58ee45453780edde82d3ff8d8cb2fb00a779a8f9))
- **react:** init provider & hook ([#74](https://github.com/logto-io/js/issues/74)) ([b30e993](https://github.com/logto-io/js/commit/b30e993e3483ebcb340dd318e12e640eddf2360e))
- **react:** react SDK with context provider ([1be502d](https://github.com/logto-io/js/commit/1be502d333c25209be44bd3a34911d3546555d7f))

### Bug Fixes

- `package.json` ([8afd534](https://github.com/logto-io/js/commit/8afd534e5d79db29c9ef1aa55cfa94549ea025b8))
- **react-sdk:** cr fix ([1fe7093](https://github.com/logto-io/js/commit/1fe709356860117ed0e5f9ed79123cb3c17727b9))
- **ut:** update jest coverage configs ([b10d84e](https://github.com/logto-io/js/commit/b10d84edbf6c1639bfaa4dbb9fa41f4a10543bde))
