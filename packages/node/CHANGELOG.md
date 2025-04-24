# Change Log

## 3.1.4

### Patch Changes

- @logto/client@3.1.2

## 3.1.3

### Patch Changes

- @logto/client@3.1.1

## 3.1.2

### Patch Changes

- Updated dependencies [d0fc122]
- Updated dependencies [b7f3d14]
  - @logto/client@3.1.0

## 3.1.1

### Patch Changes

- d6a900c: bump dependencies for security update
- Updated dependencies [d6a900c]
  - @logto/client@3.0.4

## 3.1.0

### Minor Changes

- 8c352b5: Support Next.js 15 async cookies

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

## 2.5.9

### Patch Changes

- @logto/client@2.8.2

## 2.5.8

### Patch Changes

- 8d0b058: remove the parameter of crypto, fix global undefined error in edge runtime

  Remove the default `crypto` parameter in `unwrapSession` and `wrapSession`, `global.crypto` is unavailable in edge runtime, since Node.js 20, we can access `crypto` directly, this also works in edge runtime like Vercel.

## 2.5.7

### Patch Changes

- Updated dependencies [e92940f]
  - @logto/client@2.8.1

## 2.5.6

### Patch Changes

- Updated dependencies [5b46f9c]
  - @logto/client@2.8.0

## 2.5.5

### Patch Changes

- @logto/client@2.7.3

## 2.5.4

### Patch Changes

- Updated dependencies [e0cc59f]
  - @logto/client@2.7.2

## 2.5.3

### Patch Changes

- @logto/client@2.7.1

## 2.5.2

### Patch Changes

- Updated dependencies [bf6fedc]
- Updated dependencies [2f8a855]
  - @logto/client@2.7.0

## 2.5.1

### Patch Changes

- Updated dependencies [7f477b3]
  - @logto/client@2.6.8

## 2.5.0

### Minor Changes

- 957a1c9: Add `organizationId` to `getContext` function.

  This will allow the users to get access token with "organization_id" claim, which supports organization API resources.

### Patch Changes

- Updated dependencies [bc3e8da]
  - @logto/client@2.6.7

## 2.4.7

### Patch Changes

- Updated dependencies [3e28e29]
  - @logto/client@2.6.6

## 2.4.6

### Patch Changes

- Updated dependencies [bc86d46]
  - @logto/client@2.6.5

## 2.4.5

### Patch Changes

- Updated dependencies [e30e121]
  - @logto/client@2.6.4

## 2.4.4

### Patch Changes

- 24d1680: fix: clear access token storage on sign-in
- Updated dependencies [24d1680]
  - @logto/client@2.6.3

## 2.4.3

### Patch Changes

- 76d113f: export more typescript types
- Updated dependencies [76d113f]
- Updated dependencies [e0d20a3]
  - @logto/client@2.6.2

## 2.4.2

### Patch Changes

- Updated dependencies [e6c8ec5]
  - @logto/client@2.6.1

## 2.4.1

### Patch Changes

- Updated dependencies [e643c01]
  - @logto/client@2.6.0

## 2.4.0

### Minor Changes

- 88495b2: add session utils and types

  Extracted from `@logto/next`, these utilities are useful for any Node.js application that needs to manage Logto sessions with encryption.

- 864caab: implement reusable `CookieStorage` for Node environment

  It can be used to store and retrieve encrypted cookies in Node.js environment for Logto.

### Patch Changes

- 864caab: remove `node-fetch` from dependencies (native fetch is available from [Node.js v17.5.0](https://nodejs.org/dist/latest-v18.x/docs/api/globals.html#fetch), we are targeting v20+)
- 26619ed: use TypeScript 5.3.3
- Updated dependencies [88495b2]
- Updated dependencies [c491de1]
- Updated dependencies [c491de1]
- Updated dependencies [26619ed]
- Updated dependencies [c491de1]
- Updated dependencies [c491de1]
  - @logto/client@2.4.0

## 2.3.0

### Minor Changes

- d635a10: Add organization support

### Patch Changes

- 867b357: Add Node v20 LTS support
- Updated dependencies [867b357]
  - @logto/client@2.3.3

## 2.2.2

### Patch Changes

- bump `@logto/client` version

## 2.2.1

### Patch Changes

- d253362: Fix the Buffer error in edge runtime

## 2.2.0

### Minor Changes

- 9225576: export useful members from dependency sdk packages

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

- 77480ae: Skip token decode for opaque access token

## 2.1.0

### Minor Changes

- 0a533f6: Full edge runtime support
- a839b08: Add RBAC support for NextJS SDK

### Patch Changes

- Updated dependencies [a839b08]
  - @logto/client@2.1.0

## 2.0.0

### Major Changes

- 3aa0913: set package type to ESM, keep CJS build for compatibility (#477)

### Patch Changes

- Updated dependencies [3aa0913]
  - @logto/client@2.0.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [1.1.2](https://github.com/logto-io/js/compare/v1.1.1...v1.1.2) (2023-04-24)

**Note:** Version bump only for package @logto/node

### [1.1.1](https://github.com/logto-io/js/compare/v1.1.0...v1.1.1) (2023-04-11)

**Note:** Version bump only for package @logto/node

## [1.1.0](https://github.com/logto-io/js/compare/v1.0.0...v1.1.0) (2023-03-19)

### Features

- **js:** add interactionMode props to signIn method ([ea763a5](https://github.com/logto-io/js/commit/ea763a59e41251ffad4089df0d6bb876e9901109))

## [1.0.0](https://github.com/logto-io/js/compare/v1.0.0-rc.0...v1.0.0) (2023-02-28)

**Note:** Version bump only for package @logto/node

## [1.0.0-rc.0](https://github.com/logto-io/js/compare/v1.0.0-beta.15...v1.0.0-rc.0) (2023-02-03)

### Bug Fixes

- remove core-kit dependency and update `engines` ([8a24a87](https://github.com/logto-io/js/commit/8a24a870e7b3891f5e205b3e8a9419535baa7b44))

## [1.0.0-beta.15](https://github.com/logto-io/js/compare/v1.0.0-beta.14...v1.0.0-beta.15) (2023-01-12)

**Note:** Version bump only for package @logto/node

## [1.0.0-beta.14](https://github.com/logto-io/js/compare/v1.0.0-beta.13...v1.0.0-beta.14) (2022-12-12)

**Note:** Version bump only for package @logto/node

## [1.0.0-beta.13](https://github.com/logto-io/js/compare/v1.0.0-beta.12...v1.0.0-beta.13) (2022-11-08)

### Bug Fixes

- use `.mjs` for ESM files ([#429](https://github.com/logto-io/js/issues/429)) ([2993007](https://github.com/logto-io/js/commit/2993007a0dac3c9ed79e2415fcc55059d2d7a494))

## [1.0.0-beta.12](https://github.com/logto-io/js/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2022-11-02)

**Note:** Version bump only for package @logto/node

## [1.0.0-beta.11](https://github.com/logto-io/js/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2022-10-26)

### Features

- **node,next,express:** get access token with resource ([#420](https://github.com/logto-io/js/issues/420)) ([6fb22ea](https://github.com/logto-io/js/commit/6fb22ea51a50c7a8b1b64cb6d2aa665c18b3a0b8))

### Bug Fixes

- **next-sample:** fix undefined in getServerSideProps ([#423](https://github.com/logto-io/js/issues/423)) ([f15e875](https://github.com/logto-io/js/commit/f15e875f34413b3cc1093db590c83af86c0b0374))

## [1.0.0-beta.10](https://github.com/logto-io/js/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2022-10-21)

**Note:** Version bump only for package @logto/node

## [1.0.0-beta.9](https://github.com/logto-io/js/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2022-10-19)

### Features

- **express,next,node:** support fetchUserInfo ([#413](https://github.com/logto-io/js/issues/413)) ([91431d0](https://github.com/logto-io/js/commit/91431d0328d95654928ee86db883884b85120af5))

## [1.0.0-beta.8](https://github.com/logto-io/js/compare/v1.0.0-beta.7...v1.0.0-beta.8) (2022-09-23)

**Note:** Version bump only for package @logto/node

## [1.0.0-beta.7](https://github.com/logto-io/js/compare/v1.0.0-beta.6...v1.0.0-beta.7) (2022-09-20)

**Note:** Version bump only for package @logto/node

## [1.0.0-beta.6](https://github.com/logto-io/js/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2022-09-17)

### Bug Fixes

- bump to essentials v1.2.1 to use utf-8 on decoding base64 ([5a4ad09](https://github.com/logto-io/js/commit/5a4ad093e14ffa4927a09f4f692c0c26f412b7c0))

## [1.0.0-beta.5](https://github.com/logto-io/js/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2022-09-13)

**Note:** Version bump only for package @logto/node

## [1.0.0-beta.4](https://github.com/logto-io/js/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2022-09-09)

**Note:** Version bump only for package @logto/node

## [1.0.0-beta.3](https://github.com/logto-io/js/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2022-08-22)

**Note:** Version bump only for package @logto/node

## [1.0.0-beta.2](https://github.com/logto-io/js/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2022-08-08)

### Features

- **express:** with logto ([#378](https://github.com/logto-io/js/issues/378)) ([9626b76](https://github.com/logto-io/js/commit/9626b764eb84287a1e29783a768f33190d28411d))
- **node:** support client secret ([#372](https://github.com/logto-io/js/issues/372)) ([43d0de9](https://github.com/logto-io/js/commit/43d0de9ede0a80ab7752b25f65ea5436129a20ac))

## [1.0.0-beta.0](https://github.com/logto-io/js/compare/v1.0.0-alpha.3...v1.0.0-beta.0) (2022-07-21)

### Features

- **next:** init and sign in route ([#339](https://github.com/logto-io/js/issues/339)) ([f17364a](https://github.com/logto-io/js/commit/f17364ab85d91766a07571b48aea4cb88a4f4461))
- **node:** node sdk ([#338](https://github.com/logto-io/js/issues/338)) ([2cb03c1](https://github.com/logto-io/js/commit/2cb03c18ef7e44f2a146db219e54e6e0c495fcf2))
