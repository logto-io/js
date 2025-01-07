# Change Log

## 2.2.8

### Patch Changes

- Updated dependencies [a0f91a3]
  - @logto/next@4.2.0

## 2.2.7

### Patch Changes

- Updated dependencies [8c352b5]
  - @logto/next@4.1.0

## 2.2.6

### Patch Changes

- 1fb33d0: force bump for republish
- Updated dependencies [1fb33d0]
  - @logto/next@4.0.3

## 2.2.5

### Patch Changes

- @logto/next@4.0.2

## 2.2.4

### Patch Changes

- 28bc32e: force bump for republish
- Updated dependencies [28bc32e]
  - @logto/next@4.0.1

## 2.2.3

### Patch Changes

- Updated dependencies [9fa75c6]
  - @logto/next@4.0.0

## 2.2.2

### Patch Changes

- @logto/next@3.7.2

## 2.2.1

### Patch Changes

- 8d0b058: remove the parameter of crypto, fix global undefined error in edge runtime

  Remove the default `crypto` parameter in `unwrapSession` and `wrapSession`, `global.crypto` is unavailable in edge runtime, since Node.js 20, we can access `crypto` directly, this also works in edge runtime like Vercel.

  - @logto/next@3.7.1

## 2.2.0

### Minor Changes

- 8ca35ed: add support for sign in options including first screen values and identifier config

  The function signature of `signIn` is changed to accept an options object, the old signature is deprecated and will be removed in the next major release.

### Patch Changes

- Updated dependencies [8ca35ed]
  - @logto/next@3.7.0

## 2.1.20

### Patch Changes

- @logto/next@3.6.1

## 2.1.19

### Patch Changes

- Updated dependencies [5610505]
  - @logto/next@3.6.0

## 2.1.18

### Patch Changes

- Updated dependencies [9142c6c]
  - @logto/next@3.5.0

## 2.1.17

### Patch Changes

- Updated dependencies [a40b28f]
- Updated dependencies [ff8bcbb]
  - @logto/next@3.4.0

## 2.1.16

### Patch Changes

- Updated dependencies [5f64e0e]
  - @logto/next@3.3.4

## 2.1.15

### Patch Changes

- @logto/next@3.3.3

## 2.1.14

### Patch Changes

- @logto/next@3.3.2

## 2.1.13

### Patch Changes

- @logto/next@3.3.1

## 2.1.12

### Patch Changes

- Updated dependencies [e888a7c]
  - @logto/next@3.3.0

## 2.1.11

### Patch Changes

- Updated dependencies [917158c]
  - @logto/next@3.2.7

## 2.1.10

### Patch Changes

- Updated dependencies [cf524a0]
  - @logto/next@3.2.6

## 2.1.9

### Patch Changes

- @logto/next@3.2.5

## 2.1.8

### Patch Changes

- @logto/next@3.2.4

## 2.1.7

### Patch Changes

- @logto/next@3.2.3

## 2.1.6

### Patch Changes

- Updated dependencies [24d1680]
  - @logto/next@3.2.2

## 2.1.5

### Patch Changes

- Updated dependencies [76d113f]
  - @logto/next@3.2.1

## 2.1.4

### Patch Changes

- Updated dependencies [aad00ee]
  - @logto/next@3.2.0

## 2.1.3

### Patch Changes

- @logto/next@3.1.2

## 2.1.2

### Patch Changes

- 26619ed: use TypeScript 5.3.3
- Updated dependencies [26619ed]
- Updated dependencies [b71e7c7]
- Updated dependencies [26619ed]
  - @logto/next@3.0.0

## 2.1.1

### Patch Changes

- 8d693a3: explicitly cast claim value type to adopt the new claim type definition
- Updated dependencies [9225576]
  - @logto/next@2.3.0

## 2.1.0

### Minor Changes

- 0a533f6: Full edge runtime support
- a839b08: Add RBAC support for NextJS SDK

### Patch Changes

- Updated dependencies [0a533f6]
  - @logto/next@2.1.0

## 2.0.0

### Major Changes

- 3aa0913: set package type to ESM, keep CJS build for compatibility (#477)

### Minor Changes

- 3aa0913: support nextjs edge runtime

### Patch Changes

- Updated dependencies [3aa0913]
- Updated dependencies [3aa0913]
  - @logto/next@2.0.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [1.1.2](https://github.com/logto-io/js/compare/v1.1.1...v1.1.2) (2023-04-24)

**Note:** Version bump only for package @logto/next-sample

### [1.1.1](https://github.com/logto-io/js/compare/v1.1.0...v1.1.1) (2023-04-11)

### Bug Fixes

- **next-sample:** use location assign for sign in redirect ([#465](https://github.com/logto-io/js/issues/465)) ([6286eff](https://github.com/logto-io/js/commit/6286effff3fabc5bd16a340ca01dc0528a48243c))

## [1.1.0](https://github.com/logto-io/js/compare/v1.0.0...v1.1.0) (2023-03-19)

**Note:** Version bump only for package @logto/next-sample

## [1.0.0](https://github.com/logto-io/js/compare/v1.0.0-rc.0...v1.0.0) (2023-02-28)

### Bug Fixes

- **deps:** update dependency swr to v2 ([#436](https://github.com/logto-io/js/issues/436)) ([fd63fba](https://github.com/logto-io/js/commit/fd63fbaba2ff0f3235a2ee3d152dc2b4bc243f03))

## [1.0.0-rc.0](https://github.com/logto-io/js/compare/v1.0.0-beta.15...v1.0.0-rc.0) (2023-02-03)

**Note:** Version bump only for package @logto/next-sample

## [1.0.0-beta.15](https://github.com/logto-io/js/compare/v1.0.0-beta.14...v1.0.0-beta.15) (2023-01-12)

**Note:** Version bump only for package @logto/next-sample

## [1.0.0-beta.14](https://github.com/logto-io/js/compare/v1.0.0-beta.13...v1.0.0-beta.14) (2022-12-12)

### Features

- **next-sample:** upgrade to next 13 ([#433](https://github.com/logto-io/js/issues/433)) ([63593d4](https://github.com/logto-io/js/commit/63593d46f872219e7e4a1a3896d3af4a40a5eb15))

## [1.0.0-beta.13](https://github.com/logto-io/js/compare/v1.0.0-beta.12...v1.0.0-beta.13) (2022-11-08)

**Note:** Version bump only for package @logto/next-sample

## [1.0.0-beta.12](https://github.com/logto-io/js/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2022-11-02)

**Note:** Version bump only for package @logto/next-sample

## [1.0.0-beta.11](https://github.com/logto-io/js/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2022-10-26)

### Features

- **node,next,express:** get access token with resource ([#420](https://github.com/logto-io/js/issues/420)) ([6fb22ea](https://github.com/logto-io/js/commit/6fb22ea51a50c7a8b1b64cb6d2aa665c18b3a0b8))

### Bug Fixes

- **next-sample:** fix undefined in getServerSideProps ([#423](https://github.com/logto-io/js/issues/423)) ([f15e875](https://github.com/logto-io/js/commit/f15e875f34413b3cc1093db590c83af86c0b0374))

## [1.0.0-beta.10](https://github.com/logto-io/js/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2022-10-21)

**Note:** Version bump only for package @logto/next-sample

## [1.0.0-beta.9](https://github.com/logto-io/js/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2022-10-19)

### Features

- **express,next,node:** support fetchUserInfo ([#413](https://github.com/logto-io/js/issues/413)) ([91431d0](https://github.com/logto-io/js/commit/91431d0328d95654928ee86db883884b85120af5))

## [1.0.0-beta.8](https://github.com/logto-io/js/compare/v1.0.0-beta.7...v1.0.0-beta.8) (2022-09-23)

**Note:** Version bump only for package @logto/next-sample

## [1.0.0-beta.7](https://github.com/logto-io/js/compare/v1.0.0-beta.6...v1.0.0-beta.7) (2022-09-20)

**Note:** Version bump only for package @logto/next-sample

## [1.0.0-beta.6](https://github.com/logto-io/js/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2022-09-17)

**Note:** Version bump only for package @logto/next-sample

## [1.0.0-beta.5](https://github.com/logto-io/js/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2022-09-13)

**Note:** Version bump only for package @logto/next-sample

## [1.0.0-beta.4](https://github.com/logto-io/js/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2022-09-09)

**Note:** Version bump only for package @logto/next-sample

## [1.0.0-beta.3](https://github.com/logto-io/js/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2022-08-22)

**Note:** Version bump only for package @logto/next-sample

## [1.0.0-beta.2](https://github.com/logto-io/js/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2022-08-08)

### Features

- **express:** with logto ([#378](https://github.com/logto-io/js/issues/378)) ([9626b76](https://github.com/logto-io/js/commit/9626b764eb84287a1e29783a768f33190d28411d))
- **node:** support client secret ([#372](https://github.com/logto-io/js/issues/372)) ([43d0de9](https://github.com/logto-io/js/commit/43d0de9ede0a80ab7752b25f65ea5436129a20ac))

## [1.0.0-beta.1](https://github.com/logto-io/js/compare/v1.0.0-beta.0...v1.0.0-beta.1) (2022-07-25)

### Features

- **next:** handleAuthRoutes ([#367](https://github.com/logto-io/js/issues/367)) ([5bf3a13](https://github.com/logto-io/js/commit/5bf3a133eafc3f93f77fd164352cd779f67a867a))

## [1.0.0-beta.0](https://github.com/logto-io/js/compare/v1.0.0-alpha.3...v1.0.0-beta.0) (2022-07-21)

### Features

- **next-sample:** implement nextjs sample ([#362](https://github.com/logto-io/js/issues/362)) ([406082d](https://github.com/logto-io/js/commit/406082d2cc40c70a3237d66f29888e82f04ea361))
- **next:** add sign in callback route ([#348](https://github.com/logto-io/js/issues/348)) ([80c9e34](https://github.com/logto-io/js/commit/80c9e345e816c4a0cddf0a507c18aa2593a359c5))
- **next:** init and sign in route ([#339](https://github.com/logto-io/js/issues/339)) ([f17364a](https://github.com/logto-io/js/commit/f17364ab85d91766a07571b48aea4cb88a4f4461))
- **next:** sign out ([#358](https://github.com/logto-io/js/issues/358)) ([f773ce0](https://github.com/logto-io/js/commit/f773ce00c30916ee09351bfb36a71b89e1966065))
- **next:** ssr support ([#363](https://github.com/logto-io/js/issues/363)) ([886e260](https://github.com/logto-io/js/commit/886e2601c7d465e7c980c62ce1707f2d2f74f18f))
- **next:** with logto api route ([#355](https://github.com/logto-io/js/issues/355)) ([60eb143](https://github.com/logto-io/js/commit/60eb143dca87119752f8f9cc1758240c3e3e92eb))
