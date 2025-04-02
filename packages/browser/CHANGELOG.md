# Change Log

## 3.0.6

### Patch Changes

- @logto/client@3.1.1

## 3.0.5

### Patch Changes

- Updated dependencies [d0fc122]
- Updated dependencies [b7f3d14]
  - @logto/client@3.1.0

## 3.0.4

### Patch Changes

- 733e978: support ssr for browser-based SDKs

  Check if the `window` is defined, if not, ignore the storage operations, avoid breaking the server side rendering.

  For this kind of SDKs, it doesn't make sense to be used in server side, because the auth state is usually stored in the client side which is not available in server side. So we can safely ignore the storage operations in server side.

- d6a900c: bump dependencies for security update
- Updated dependencies [d6a900c]
  - @logto/client@3.0.4

## 3.0.3

### Patch Changes

- 1fb33d0: force bump for republish
- Updated dependencies [1fb33d0]
  - @logto/client@3.0.3

## 3.0.2

### Patch Changes

- Updated dependencies [46b26bd]
  - @logto/client@3.0.2

## 3.0.1

### Patch Changes

- 28bc32e: force bump for republish
- Updated dependencies [28bc32e]
  - @logto/client@3.0.1

## 3.0.0

### Major Changes

- 9fa75c6: drop CommonJS support and become pure ESM

### Patch Changes

- Updated dependencies [9fa75c6]
  - @logto/client@3.0.0

## 2.2.19

### Patch Changes

- @logto/client@2.8.2

## 2.2.18

### Patch Changes

- Updated dependencies [e92940f]
  - @logto/client@2.8.1

## 2.2.17

### Patch Changes

- Updated dependencies [5b46f9c]
  - @logto/client@2.8.0

## 2.2.16

### Patch Changes

- @logto/client@2.7.3

## 2.2.15

### Patch Changes

- Updated dependencies [e0cc59f]
  - @logto/client@2.7.2

## 2.2.14

### Patch Changes

- @logto/client@2.7.1

## 2.2.13

### Patch Changes

- Updated dependencies [bf6fedc]
- Updated dependencies [2f8a855]
  - @logto/client@2.7.0

## 2.2.12

### Patch Changes

- Updated dependencies [7f477b3]
  - @logto/client@2.6.8

## 2.2.11

### Patch Changes

- Updated dependencies [bc3e8da]
  - @logto/client@2.6.7

## 2.2.10

### Patch Changes

- Updated dependencies [3e28e29]
  - @logto/client@2.6.6

## 2.2.9

### Patch Changes

- Updated dependencies [bc86d46]
  - @logto/client@2.6.5

## 2.2.8

### Patch Changes

- Updated dependencies [e30e121]
  - @logto/client@2.6.4

## 2.2.7

### Patch Changes

- 24d1680: fix: clear access token storage on sign-in
- Updated dependencies [24d1680]
  - @logto/client@2.6.3

## 2.2.6

### Patch Changes

- e0d20a3: export `Storage`, `isLogtoRequestError`, `BrowserStorage`
- 76d113f: export more typescript types
- Updated dependencies [76d113f]
- Updated dependencies [e0d20a3]
  - @logto/client@2.6.2

## 2.2.5

### Patch Changes

- Updated dependencies [e6c8ec5]
  - @logto/client@2.6.1

## 2.2.4

### Patch Changes

- Updated dependencies [e643c01]
  - @logto/client@2.6.0

## 2.2.3

### Patch Changes

- 26619ed: use TypeScript 5.3.3
- Updated dependencies [88495b2]
- Updated dependencies [c491de1]
- Updated dependencies [c491de1]
- Updated dependencies [26619ed]
- Updated dependencies [c491de1]
- Updated dependencies [c491de1]
  - @logto/client@2.4.0

## 2.2.2

### Patch Changes

- 867b357: Add Node v20 LTS support
- Updated dependencies [867b357]
  - @logto/client@2.3.3

## 2.2.1

### Patch Changes

- bump `@logto/client` version

## 2.2.0

### Minor Changes

- 8d693a3: export useful members from dependency sdk packages

### Patch Changes

- Updated dependencies [8d693a3]
  - @logto/client@2.3.0

## 2.1.2

### Patch Changes

- f9ff6f4: Align the js SDK error type exports.

  - @logto/react: add `LogtoRequestError` export
  - @logto/vue: add `LogtoRequestError` export
  - @logto/express: add logto errors export
  - @logto/next: add logto errors export

- Updated dependencies [05b9d3e]
- Updated dependencies [f9ff6f4]
  - @logto/client@2.2.3

## 2.1.1

### Patch Changes

- eb94b36: add comment annotations for better dev experience
- Updated dependencies [eb94b36]
  - @logto/client@2.2.2

## 2.1.0

### Minor Changes

- 90ef48f: add well-known cache support (unstable)

  - client: support `unstable_cache` in `ClientAdapter`
  - browser, react: add `unstable_enableCache` option to enable a `sessionStorage` cache for well-known data

### Patch Changes

- Updated dependencies [90ef48f]
  - @logto/client@2.2.0

## 2.0.0

### Major Changes

- 3aa0913: set package type to ESM, keep CJS build for compatibility (#477)

### Patch Changes

- Updated dependencies [3aa0913]
  - @logto/client@2.0.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [1.1.2](https://github.com/logto-io/js/compare/v1.1.1...v1.1.2) (2023-04-24)

### Bug Fixes

- browser tests ([0d1ca67](https://github.com/logto-io/js/commit/0d1ca674402966bbc994c5463e0c002091f72ac5))

### [1.1.1](https://github.com/logto-io/js/compare/v1.1.0...v1.1.1) (2023-04-11)

**Note:** Version bump only for package @logto/browser

## [1.1.0](https://github.com/logto-io/js/compare/v1.0.0...v1.1.0) (2023-03-19)

### Features

- **js:** add interactionMode props to signIn method ([ea763a5](https://github.com/logto-io/js/commit/ea763a59e41251ffad4089df0d6bb876e9901109))

## [1.0.0](https://github.com/logto-io/js/compare/v1.0.0-rc.0...v1.0.0) (2023-02-28)

**Note:** Version bump only for package @logto/browser

## [1.0.0-rc.0](https://github.com/logto-io/js/compare/v1.0.0-beta.15...v1.0.0-rc.0) (2023-02-03)

**Note:** Version bump only for package @logto/browser

## [1.0.0-beta.15](https://github.com/logto-io/js/compare/v1.0.0-beta.14...v1.0.0-beta.15) (2023-01-12)

**Note:** Version bump only for package @logto/browser

## [1.0.0-beta.14](https://github.com/logto-io/js/compare/v1.0.0-beta.13...v1.0.0-beta.14) (2022-12-12)

**Note:** Version bump only for package @logto/browser

## [1.0.0-beta.13](https://github.com/logto-io/js/compare/v1.0.0-beta.12...v1.0.0-beta.13) (2022-11-08)

### Bug Fixes

- use `.mjs` for ESM files ([#429](https://github.com/logto-io/js/issues/429)) ([2993007](https://github.com/logto-io/js/commit/2993007a0dac3c9ed79e2415fcc55059d2d7a494))

## [1.0.0-beta.12](https://github.com/logto-io/js/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2022-11-02)

**Note:** Version bump only for package @logto/browser

## [1.0.0-beta.11](https://github.com/logto-io/js/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2022-10-26)

**Note:** Version bump only for package @logto/browser

## [1.0.0-beta.10](https://github.com/logto-io/js/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2022-10-21)

**Note:** Version bump only for package @logto/browser

## [1.0.0-beta.9](https://github.com/logto-io/js/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2022-10-19)

**Note:** Version bump only for package @logto/browser

## [1.0.0-beta.8](https://github.com/logto-io/js/compare/v1.0.0-beta.7...v1.0.0-beta.8) (2022-09-23)

**Note:** Version bump only for package @logto/browser

## [1.0.0-beta.7](https://github.com/logto-io/js/compare/v1.0.0-beta.6...v1.0.0-beta.7) (2022-09-20)

**Note:** Version bump only for package @logto/browser

## [1.0.0-beta.6](https://github.com/logto-io/js/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2022-09-17)

### Features

- **browser,react,vue:** enable userinfo endpoint ([cae6eff](https://github.com/logto-io/js/commit/cae6effd1b75b31627b896e210f6acda46faedeb))

### Bug Fixes

- bump to essentials v1.2.1 to use utf-8 on decoding base64 ([5a4ad09](https://github.com/logto-io/js/commit/5a4ad093e14ffa4927a09f4f692c0c26f412b7c0))

## [1.0.0-beta.5](https://github.com/logto-io/js/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2022-09-13)

**Note:** Version bump only for package @logto/browser

## [1.0.0-beta.4](https://github.com/logto-io/js/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2022-09-09)

**Note:** Version bump only for package @logto/browser

## [1.0.0-beta.3](https://github.com/logto-io/js/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2022-08-22)

**Note:** Version bump only for package @logto/browser

## [1.0.0-beta.2](https://github.com/logto-io/js/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2022-08-08)

**Note:** Version bump only for package @logto/browser

## [1.0.0-beta.0](https://github.com/logto-io/js/compare/v1.0.0-alpha.3...v1.0.0-beta.0) (2022-07-21)

**Note:** Version bump only for package @logto/browser

## [1.0.0-alpha.2](https://github.com/logto-io/js/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2022-07-08)

**Note:** Version bump only for package @logto/browser

## [1.0.0-alpha.1](https://github.com/logto-io/js/compare/v1.0.0-alpha.0...v1.0.0-alpha.1) (2022-07-07)

**Note:** Version bump only for package @logto/browser

## [1.0.0-alpha.0](https://github.com/logto-io/js/compare/v0.2.2...v1.0.0-alpha.0) (2022-07-07)

### Bug Fixes

- packing ([#321](https://github.com/logto-io/js/issues/321)) ([c808005](https://github.com/logto-io/js/commit/c8080058fa1861c02f264a0d8db568c0292d3d7f))

### [0.2.2](https://github.com/logto-io/js/compare/v0.2.1...v0.2.2) (2022-06-30)

### Bug Fixes

- **browser:** should use prompt param on sign-in ([#319](https://github.com/logto-io/js/issues/319)) ([08ceb64](https://github.com/logto-io/js/commit/08ceb6423034289b31086811bbed9e225509549b))

### [0.2.1](https://github.com/logto-io/js/compare/v0.2.0...v0.2.1) (2022-06-30)

**Note:** Version bump only for package @logto/browser

## [0.2.0](https://github.com/logto-io/js/compare/v0.1.18...v0.2.0) (2022-06-30)

### Features

- **js,browser:** configurable prompt ([#311](https://github.com/logto-io/js/issues/311)) ([2b9ae04](https://github.com/logto-io/js/commit/2b9ae0460f35e636aee448c46f810c74b6e5b230))
- remove userinfo ([#317](https://github.com/logto-io/js/issues/317)) ([3f9d412](https://github.com/logto-io/js/commit/3f9d412cb2ec930fe036c8ad9c7d1568498581e8))

### [0.1.18](https://github.com/logto-io/js/compare/v0.1.17...v0.1.18) (2022-06-29)

**Note:** Version bump only for package @logto/browser

### [0.1.17](https://github.com/logto-io/js/compare/v0.1.16...v0.1.17) (2022-06-29)

### Bug Fixes

- **deps:** update dependency superstruct to ^0.16.0 ([#302](https://github.com/logto-io/js/issues/302)) ([d23c3d3](https://github.com/logto-io/js/commit/d23c3d393a55e508c2173d0ce0a14320e33f2873))
- **js SDK:** getAccessTokenByRefreshToken should not return idToken ([95a1b96](https://github.com/logto-io/js/commit/95a1b9659040a4d6a7f387387c1b927c9389f01a))
- **js:** refresh access token without a resource should return id token ([05d34d6](https://github.com/logto-io/js/commit/05d34d6d389e0bac9889c1ee7cbb937a78173d0c))

### [0.1.16](https://github.com/logto-io/js/compare/v0.1.15...v0.1.16) (2022-06-14)

### Features

- **browser:** append reserved scopes in LogtoClient constructor ([#305](https://github.com/logto-io/js/issues/305)) ([296f6d6](https://github.com/logto-io/js/commit/296f6d65a2ef7514a035c8f06dc921ce049e62b2))

### [0.1.14](https://github.com/logto-io/js/compare/v0.1.13...v0.1.14) (2022-06-02)

**Note:** Version bump only for package @logto/browser

### [0.1.11](https://github.com/logto-io/js/compare/v0.1.10...v0.1.11) (2022-05-28)

**Note:** Version bump only for package @logto/browser

### [0.1.10](https://github.com/logto-io/js/compare/v0.1.9...v0.1.10) (2022-05-28)

**Note:** Version bump only for package @logto/browser

### [0.1.7](https://github.com/logto-io/js/compare/v0.1.6...v0.1.7) (2022-05-17)

### Bug Fixes

- **browser:** clear authenticated status before signing-in ([bd0b921](https://github.com/logto-io/js/commit/bd0b921eb78176d13df6d1c990efe7a1f513f4b8))

### [0.1.5](https://github.com/logto-io/js/compare/v0.1.4...v0.1.5) (2022-05-05)

### Bug Fixes

- **browser:** read/write refreshToken from/to localStorage only ([5e95349](https://github.com/logto-io/js/commit/5e9534945bfb069d5e1b6206a1899ef6e69ab4d9))
- **browser:** remove session item after successful sign-in ([f33bcd2](https://github.com/logto-io/js/commit/f33bcd23807a09e84a491e535fc288a4e1f33f19))
- leverage root `prepack` lifecycle for publish ([#235](https://github.com/logto-io/js/issues/235)) ([8e66d82](https://github.com/logto-io/js/commit/8e66d82dacd204c32ffc39f4440b47e0f7541cc3))

### [0.1.4](https://github.com/logto-io/js/compare/v0.1.3...v0.1.4) (2022-03-18)

### Features

- **browser:** reuse remote jwks and odic config ([#231](https://github.com/logto-io/js/issues/231)) ([1469bb1](https://github.com/logto-io/js/commit/1469bb16a5009aaca5f42b73add341204e7accf4))

### [0.1.3](https://github.com/logto-io/js/compare/v0.1.2...v0.1.3) (2022-03-16)

**Note:** Version bump only for package @logto/browser

### [0.1.2](https://github.com/logto-io/js/compare/v0.1.2-rc.1...v0.1.2) (2022-03-10)

**Note:** Version bump only for package @logto/browser

### [0.1.2-rc.1](https://github.com/logto-io/js/compare/v0.1.2-rc.0...v0.1.2-rc.1) (2022-03-10)

**Note:** Version bump only for package @logto/browser

### [0.1.2-rc.0](https://github.com/logto-io/js/compare/v0.1.1-rc.0...v0.1.2-rc.0) (2022-03-10)

### Bug Fixes

- remove `prepublish` script ([#221](https://github.com/logto-io/js/issues/221)) ([cc89533](https://github.com/logto-io/js/commit/cc895337762cf7740578a8eb14835ed0d5d72905))

### [0.1.1-rc.0](https://github.com/logto-io/js/compare/v0.1.0...v0.1.1-rc.0) (2022-03-10)

### Bug Fixes

- add `publishConfig` to packages ([a809e25](https://github.com/logto-io/js/commit/a809e257982f7d3c31f104fa5daf983c535adfc5))

## 0.1.0 (2022-03-10)

### Features

- **browser-sample:** init package ([10076e1](https://github.com/logto-io/js/commit/10076e15e6c491c2584cb8a0269f0d7bfddef526))
- **browser:** add LogtoClient constructor ([0a09559](https://github.com/logto-io/js/commit/0a09559e25eb2badcfe390ad0e99756c8ef96f1c))
- **browser:** add LogtoClient constructor ([#160](https://github.com/logto-io/js/issues/160)) ([d738c0b](https://github.com/logto-io/js/commit/d738c0b842476f1ba72e0acd1ee1dd79d0689ce0))
- **browser:** browser end user information getters ([b93ebe4](https://github.com/logto-io/js/commit/b93ebe40c04fc76c365b72761a05a01416e4bee2))
- **browser:** check if sign-in redirect URI has been redirected ([3baabcf](https://github.com/logto-io/js/commit/3baabcff3776ef9be5064870b979a517df4c1fd8))
- **browser:** export js core types from browser SDK ([325cfdf](https://github.com/logto-io/js/commit/325cfdf7dc61202b369d535a91fe71b81b78248c))
- **browser:** handle sign-in callback ([#181](https://github.com/logto-io/js/issues/181)) ([58a4792](https://github.com/logto-io/js/commit/58a47924923bae27f69db6585322820c634f4688))
- **browser:** sign out ([6e85fac](https://github.com/logto-io/js/commit/6e85facc8d71d1b62e2eb57e1ffa29061fd8e68e))
- **browser:** sign-in session storage ([#175](https://github.com/logto-io/js/issues/175)) ([98120fd](https://github.com/logto-io/js/commit/98120fd69bcdbf5262972adcf5116bb97aab7c50))
- **browser:** signIn ([#170](https://github.com/logto-io/js/issues/170)) ([2418193](https://github.com/logto-io/js/commit/24181931643472318345678ec68b7e874a72fd5a))

### Bug Fixes

- `package.json` ([8afd534](https://github.com/logto-io/js/commit/8afd534e5d79db29c9ef1aa55cfa94549ea025b8))
- **browser:** getAccessToken saves refreshToken and idToken ([#191](https://github.com/logto-io/js/issues/191)) ([cb768f0](https://github.com/logto-io/js/commit/cb768f0a2b1353dbeab427b04fcd21f932a4b061))
- **browser:** isSignInRedirected should return false when session is empty ([#210](https://github.com/logto-io/js/issues/210)) ([ca4ad2c](https://github.com/logto-io/js/commit/ca4ad2c0f2ab5a723a33b9c3dae2bd76c92f9b43))
- **browser:** should use userinfo_endpoint in fetchUserInfo function ([04caf8d](https://github.com/logto-io/js/commit/04caf8d43af099a15f58d4e7653a453f56733e6d))
- **ut:** update jest coverage configs ([b10d84e](https://github.com/logto-io/js/commit/b10d84edbf6c1639bfaa4dbb9fa41f4a10543bde))
