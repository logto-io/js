# Change Log

## 3.0.0

### Major Changes

- 9fa75c6: drop CommonJS support and become pure ESM

### Patch Changes

- Updated dependencies [9fa75c6]
  - @logto/js@5.0.0

## 2.8.2

### Patch Changes

- Updated dependencies [7980dec]
  - @logto/js@4.2.1

## 2.8.1

### Patch Changes

- e92940f: add react-native package export condition

  [Enabling package export](https://reactnative.dev/blog/2023/06/21/package-exports-support#enabling-package-exports-beta) in react-native is unstable and can cause issues.

  Replace the `exports` in `@logto/client` package.json with the `react-native` [condition](https://reactnative.dev/blog/2023/06/21/package-exports-support#the-new-react-native-condition).

  ```json
  {
    "react-native": "./lib/shim.js"
  }
  ```

  So the `shim.js` module can be used in react-native projects, without enabling the unstable package export feature.

## 2.8.0

### Minor Changes

- 5b46f9c: add support for identifier-based and single sign-on first screens and configurable identifiers

  You can now set `identifier:sign_in`, `identifier:register`, `single_sign_on` or `reset_password` as the first screen in the sign-in process. Additionally, you can specify which identifiers (`email`, `phone`, `username`) are allowed for `identifier:sign_in`, `identifier:register` and `reset_password` flows.

  Note the the original `interactionMode` is now deprecated, please use the new `firstScreen` option instead.

  Example (React):

  ```typescript
  signIn({
    redirectUri,
    firstScreen: "identifier:sign_in",
    identifiers: ["email", "phone"],
  });
  ```

### Patch Changes

- Updated dependencies [5b46f9c]
- Updated dependencies [cb57a5e]
  - @logto/js@4.2.0

## 2.7.3

### Patch Changes

- Updated dependencies [5f64e0e]
  - @logto/js@4.1.5

## 2.7.2

### Patch Changes

- e0cc59f: fix request error handler

  Clone the response object before consuming it to avoid the unexpected "Body has already been consumed." error.

## 2.7.1

### Patch Changes

- Updated dependencies [6b1eb78]
  - @logto/js@4.1.4

## 2.7.0

### Minor Changes

- bf6fedc: - support clock tolerance config in `DefaultJwtVerifier`

  - allow set `jwtVerifier` after `LogtoClient` instance created

  ```ts
  const client = new LogtoClient(
    config,
    adapters,
    (client) => new DefaultJwtVerifier(client, { clockTolerance: 10 }),
  );

  client.setJwtVerifier(new DefaultJwtVerifier(client, { clockTolerance: 20 }));
  ```

### Patch Changes

- 2f8a855: improve `LogtoRequestError`

  - Add `cause` property to `LogtoRequestError` to expose the original response.
  - Make `isLogtoRequestError` more reliable by checking the instance of the error and the `name` property.

- Updated dependencies [2f8a855]
  - @logto/js@4.1.3

## 2.6.8

### Patch Changes

- 7f477b3: allow not including reserved scopes by setting `includeReservedScopes` to `false`
- Updated dependencies [7f477b3]
- Updated dependencies [7f477b3]
  - @logto/js@4.1.2

## 2.6.7

### Patch Changes

- bc3e8da: Fix the bug of granting mutiple organization tokens concurrently.

  This is a bug fix for the issue that the client is not able to grant multiple organization tokens concurrently. The issue is caused by the memoize function that caches the organization token request, which leads to the token request being memoized by incorrect key and not being able to be granted concurrently. This fix updates the memoize function to cache by the correct key.

## 2.6.6

### Patch Changes

- 3e28e29: add new method "clearAllTokens()" to clear all cached tokens from storage

## 2.6.5

### Patch Changes

- bc86d46: export "clearAccessToken()" method from Client SDK

## 2.6.4

### Patch Changes

- e30e121: add prompt parameter to sign in function.

  This change adds a prompt parameter to the signIn function in the @logto/client package. This parameter allows you to specify the prompt parameter in the `signIn()` method, with which the developer can override the prompt value pre-defined in the Logto configs.

## 2.6.3

### Patch Changes

- 24d1680: fix: clear access token storage on sign-in

## 2.6.2

### Patch Changes

- 76d113f: export more typescript types
- e0d20a3: export `isLogtoRequestError`

## 2.6.1

### Patch Changes

- e6c8ec5: add `signIn(redirectUri: string)` as a normal signature
- Updated dependencies [e6c8ec5]
- Updated dependencies [1975235]
  - @logto/js@4.1.1

## 2.6.0

### Minor Changes

- e643c01: support `firstScreen`, `directSignIn`, and `extraParams` for sign-in

### Patch Changes

- Updated dependencies [e643c01]
  - @logto/js@4.1.0

## 2.5.1

### Patch Changes

- f739621: support login_hint param on sign-in.
- Updated dependencies [f739621]
  - @logto/js@4.0.1

## 2.5.0

### Minor Changes

- 65fca8c: support `postRedirectUri` to navigate to a URI after sign-in callback

## 2.4.0

### Minor Changes

- c491de1: support custom jwt verifier

  Now it's possible to pass a `JwtVerifier` instance to the Logto client adapter to verify the JWT token. The client also has a built-in verifier that keeps the same behavior as before.

- c491de1: provide a shim version without importing `jose` (`@logto/client/shim`)

  It can avoid the use of `jose` package which is useful for certain environments that don't support native modules like `crypto`. (e.g. React Native)

  To use the shim client:

  ```ts
  import { StandardLogtoClient } from "@logto/client/shim";
  ```

  The `StandardLogtoClient` class is identical to the original `LogtoClient` class, except it doesn't have the default JWT verifier implemented.

- c491de1: update prompt usage to allow multiple values

  - Logto config supports both `Prompt` and `Prompt[]` types now.
  - Added `Prompt.None` enum value.

### Patch Changes

- 88495b2: export `JwtVerifier` type
- c491de1: refactor adapter types

  - `generateState()`, `generateCodeVerifier()`, `generateCodeChallenge()` now accept both Promise and non-Promise return types.
  - the navigate function now calls with a second parameter which has the state information. (`{ redirectUri?: string; for: 'sign-in' | 'sign-out' }`)

- 26619ed: use TypeScript 5.3.3
- Updated dependencies [c491de1]
- Updated dependencies [c491de1]
- Updated dependencies [26619ed]
- Updated dependencies [c491de1]
- Updated dependencies [2febe71]
  - @logto/js@4.0.0

## 2.3.3

### Patch Changes

- 867b357: Add Node v20 LTS support
- Updated dependencies [867b357]
  - @logto/js@3.0.2

## 2.3.2

### Patch Changes

- efdf5c5: Fix a potential build issue in Vue, which is caused by using private method in Client SDK.

## 2.3.1

### Patch Changes

- 3a0713d: refactor method execution

  - `getOidcConfig()` will only run once
  - `handleSignInCallback()` is now memoized to prevent unnecessary calls (e.g. in React strict mode)

## 2.3.0

### Minor Changes

- 8d693a3: add organizations support

  - add `getOrganizationToken()` and `getOrganizationTokenClaims()` to `LogtoClient`
  - automatically add organization resource to configuration when `scopes`` contains organization scope

### Patch Changes

- Updated dependencies [8d693a3]
- Updated dependencies [8d693a3]
  - @logto/js@3.0.0

## 2.2.4

### Patch Changes

- cd5ad7d: reuse `getAccessToken()` Promise when there's an ongoing one to avoid multiple calls to the server

## 2.2.3

### Patch Changes

- 05b9d3e: update "RefreshTokenTokenResponse" type in core JS SDK and set "refresh_token" field as optional
- f9ff6f4: Align the js SDK error type exports.

  - @logto/react: add `LogtoRequestError` export
  - @logto/vue: add `LogtoRequestError` export
  - @logto/express: add logto errors export
  - @logto/next: add logto errors export

- Updated dependencies [05b9d3e]
  - @logto/js@2.1.3

## 2.2.2

### Patch Changes

- eb94b36: add comment annotations for better dev experience
- Updated dependencies [eb94b36]
  - @logto/js@2.1.2

## 2.2.1

### Patch Changes

- 5ed5b92: Use `requestedAt` + `expiresIn` to calculate an approximately `expiredAt` timestamp, in order to ensure it is always smaller than the actual `exp` timestamp in access token claims.

## 2.2.0

### Minor Changes

- 90ef48f: add well-known cache support (unstable)

  - client: support `unstable_cache` in `ClientAdapter`
  - browser, react: add `unstable_enableCache` option to enable a `sessionStorage` cache for well-known data

## 2.1.0

### Minor Changes

- a839b08: Add RBAC support for NextJS SDK

### Patch Changes

- Updated dependencies [a839b08]
  - @logto/js@2.1.0

## 2.0.0

### Major Changes

- 3aa0913: set package type to ESM, keep CJS build for compatibility (#477)

### Patch Changes

- Updated dependencies [3aa0913]
  - @logto/js@2.0.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [1.1.2](https://github.com/logto-io/js/compare/v1.1.1...v1.1.2) (2023-04-24)

### Bug Fixes

- remove id token check for sign out ([#474](https://github.com/logto-io/js/issues/474)) ([fc73418](https://github.com/logto-io/js/commit/fc73418f0a48ff3f5e760f706cf625883b15849e))

### [1.1.1](https://github.com/logto-io/js/compare/v1.1.0...v1.1.1) (2023-04-11)

**Note:** Version bump only for package @logto/client

## [1.1.0](https://github.com/logto-io/js/compare/v1.0.0...v1.1.0) (2023-03-19)

### Features

- **js:** add interactionMode props to signIn method ([ea763a5](https://github.com/logto-io/js/commit/ea763a59e41251ffad4089df0d6bb876e9901109))

## [1.0.0](https://github.com/logto-io/js/compare/v1.0.0-rc.0...v1.0.0) (2023-02-28)

**Note:** Version bump only for package @logto/client

## [1.0.0-rc.0](https://github.com/logto-io/js/compare/v1.0.0-beta.15...v1.0.0-rc.0) (2023-02-03)

### Bug Fixes

- remove core-kit dependency and update `engines` ([8a24a87](https://github.com/logto-io/js/commit/8a24a870e7b3891f5e205b3e8a9419535baa7b44))

## [1.0.0-beta.15](https://github.com/logto-io/js/compare/v1.0.0-beta.14...v1.0.0-beta.15) (2023-01-12)

### Features

- **client:** remove scope for access token grant ([#439](https://github.com/logto-io/js/issues/439)) ([52468fd](https://github.com/logto-io/js/commit/52468fd2bb98c8178efa3d4af63b7dd22b75326d))

## [1.0.0-beta.14](https://github.com/logto-io/js/compare/v1.0.0-beta.13...v1.0.0-beta.14) (2022-12-12)

**Note:** Version bump only for package @logto/client

## [1.0.0-beta.13](https://github.com/logto-io/js/compare/v1.0.0-beta.12...v1.0.0-beta.13) (2022-11-08)

### Bug Fixes

- use `.mjs` for ESM files ([#429](https://github.com/logto-io/js/issues/429)) ([2993007](https://github.com/logto-io/js/commit/2993007a0dac3c9ed79e2415fcc55059d2d7a494))

## [1.0.0-beta.12](https://github.com/logto-io/js/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2022-11-02)

### Bug Fixes

- **client:** remove access token from storage after sign-out ([90f50de](https://github.com/logto-io/js/commit/90f50de6cdac575305510f4bfdf35b17bf9e4a0e))

## [1.0.0-beta.11](https://github.com/logto-io/js/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2022-10-26)

### Bug Fixes

- **deps:** update dependency @logto/core-kit to v1.0.0-beta.20 ([d9750b1](https://github.com/logto-io/js/commit/d9750b16d79172fb4e9a1166c3f0623452570686))

## [1.0.0-beta.10](https://github.com/logto-io/js/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2022-10-21)

### Bug Fixes

- **deps:** update dependency @logto/core-kit to v1.0.0-beta.19 ([ae0be3b](https://github.com/logto-io/js/commit/ae0be3b6c9bc09f4f291dbb1e2a5be6de3d7afb1))

## [1.0.0-beta.9](https://github.com/logto-io/js/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2022-10-19)

### Bug Fixes

- **deps:** update dependency @logto/core-kit to v1.0.0-beta.16 ([b65a499](https://github.com/logto-io/js/commit/b65a4994dbe43293ac08ba40f07967cf3daaca75))

## [1.0.0-beta.8](https://github.com/logto-io/js/compare/v1.0.0-beta.7...v1.0.0-beta.8) (2022-09-23)

**Note:** Version bump only for package @logto/client

## [1.0.0-beta.7](https://github.com/logto-io/js/compare/v1.0.0-beta.6...v1.0.0-beta.7) (2022-09-20)

### Bug Fixes

- remove persist access token ([#406](https://github.com/logto-io/js/issues/406)) ([f2ba84f](https://github.com/logto-io/js/commit/f2ba84f07e8486e2edf6f35e06446738ea0158e7))

## [1.0.0-beta.6](https://github.com/logto-io/js/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2022-09-17)

### Bug Fixes

- bump to essentials v1.2.1 to use utf-8 on decoding base64 ([5a4ad09](https://github.com/logto-io/js/commit/5a4ad093e14ffa4927a09f4f692c0c26f412b7c0))

## [1.0.0-beta.5](https://github.com/logto-io/js/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2022-09-13)

### Features

- **js,client:** enable user endpoint in js core and client sdks ([abd2842](https://github.com/logto-io/js/commit/abd28427f36594d9fa90a9c4aa27b526d9150d5a))

## [1.0.0-beta.4](https://github.com/logto-io/js/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2022-09-09)

**Note:** Version bump only for package @logto/client

## [1.0.0-beta.3](https://github.com/logto-io/js/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2022-08-22)

**Note:** Version bump only for package @logto/client

## [1.0.0-beta.2](https://github.com/logto-io/js/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2022-08-08)

### Features

- **node:** support client secret ([#372](https://github.com/logto-io/js/issues/372)) ([43d0de9](https://github.com/logto-io/js/commit/43d0de9ede0a80ab7752b25f65ea5436129a20ac))

## [1.0.0-beta.0](https://github.com/logto-io/js/compare/v1.0.0-alpha.3...v1.0.0-beta.0) (2022-07-21)

### Features

- **client:** add client package ([#329](https://github.com/logto-io/js/issues/329)) ([04c7b56](https://github.com/logto-io/js/commit/04c7b56d8db7d560380370ecbd6544de70145251))
- **client:** persist access token ([#359](https://github.com/logto-io/js/issues/359)) ([10fb181](https://github.com/logto-io/js/commit/10fb1813648fd01ad2f0322fafe731e24d354829))
- **node:** node sdk ([#338](https://github.com/logto-io/js/issues/338)) ([2cb03c1](https://github.com/logto-io/js/commit/2cb03c18ef7e44f2a146db219e54e6e0c495fcf2))
