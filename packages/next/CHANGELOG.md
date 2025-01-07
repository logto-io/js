# Change Log

## 4.2.0

### Minor Changes

- a0f91a3: support custom external session storage

  Add `sessionWrapper` to the config, you can implement your own session wrapper to support custom external session storage.

  Take a look at the example below:

  ```ts
  import { MemorySessionWrapper } from './storage';

  export const config = {
    // ...
    sessionWrapper: new MemorySessionWrapper(),
  };
  ```

  ```ts
  import { randomUUID } from 'node:crypto';

  import { type SessionWrapper, type SessionData } from '@logto/next';

  export class MemorySessionWrapper implements SessionWrapper {
    private readonly storage = new Map<string, unknown>();

    async wrap(data: unknown, _key: string): Promise<string> {
      const sessionId = randomUUID();
      this.storage.set(sessionId, data);
      return sessionId;
    }

    async unwrap(value: string, _key: string): Promise<SessionData> {
      if (!value) {
        return {};
      }

      const data = this.storage.get(value);
      return data ?? {};
    }
  }
  ```

  You can implement your own session wrapper to support custom external session storage like Redis, Memcached, etc.

## 4.1.0

### Minor Changes

- 8c352b5: Support Next.js 15 async cookies

### Patch Changes

- Updated dependencies [8c352b5]
  - @logto/node@3.1.0

## 4.0.3

### Patch Changes

- 1fb33d0: force bump for republish
- Updated dependencies [1fb33d0]
  - @logto/node@3.0.3

## 4.0.2

### Patch Changes

- @logto/node@3.0.2

## 4.0.1

### Patch Changes

- 28bc32e: force bump for republish
- Updated dependencies [28bc32e]
  - @logto/node@3.0.1

## 4.0.0

### Major Changes

- 9fa75c6: drop CommonJS support and become pure ESM

### Patch Changes

- Updated dependencies [9fa75c6]
  - @logto/node@3.0.0

## 3.7.2

### Patch Changes

- @logto/node@2.5.9

## 3.7.1

### Patch Changes

- Updated dependencies [8d0b058]
  - @logto/node@2.5.8

## 3.7.0

### Minor Changes

- 8ca35ed: add support for sign in options including first screen values and identifier config

  The function signature of `signIn` is changed to accept an options object, the old signature is deprecated and will be removed in the next major release.

## 3.6.1

### Patch Changes

- @logto/node@2.5.7

## 3.6.0

### Minor Changes

- 5610505: add getAccessToken and getOrganizationToken methods for pages router

  You can now use `getAccessToken(request, response, 'resource-indicator')` to get access token directly in your pages router. And `getOrganizationToken` is also available to get organization token.

### Patch Changes

- @logto/node@2.5.6

## 3.5.0

### Minor Changes

- 9142c6c: add getAccessTokenRSC to the server actions package

  Introduced two new asynchronous functions, getAccessTokenRSC and getOrganizationTokenRSC, designed to retrieve access tokens within React Server Components (RSC) environments. These functions facilitate token management in a server-side context without updating the session, since in RSC cookies are not writable.

## 3.4.0

### Minor Changes

- a40b28f: add getAccessToken to the server actions package

  Previously, in order to get access tokens (and organization tokens) in App Router, you'll use `getLogtoContext` with config `{ getAccessToken: true }`, this won't cache the token and will make a network request every time you call it. That is because Next.js does not allow to write cookies in the server side: HTTP does not allow setting cookies after streaming starts, so you must use .set() in a Server Action or Route Handler.

  This change adds a new function `getAccessToken` for you to get the access token in a server action or a route handler. It will cache the token and only make a network request when the token is expired.

  And also, this change adds a new function `getOrganizationToken` for you to get the organization token.

  The original method is deprecated and will be removed in the future.

- ff8bcbb: support custom error handler for all methods in pages router

## 3.3.4

### Patch Changes

- 5f64e0e: export `UserInfoResponse` type
  - @logto/node@2.5.5

## 3.3.3

### Patch Changes

- @logto/node@2.5.4

## 3.3.2

### Patch Changes

- @logto/node@2.5.3

## 3.3.1

### Patch Changes

- @logto/node@2.5.2

## 3.3.0

### Minor Changes

- e888a7c: add error handler to handleAuthRoutes

  You can now pass a custom error handler to handleAuthRoutes. This will allow you to handle errors in a way that makes sense for your application.

## 3.2.7

### Patch Changes

- 917158c: support custom redirectUri for handleSignIn function in Server Actions.
  - @logto/node@2.5.1

## 3.2.6

### Patch Changes

- cf524a0: Export type LogtoNextConfig
- Updated dependencies [957a1c9]
  - @logto/node@2.5.0

## 3.2.5

### Patch Changes

- @logto/node@2.4.7

## 3.2.4

### Patch Changes

- @logto/node@2.4.6

## 3.2.3

### Patch Changes

- @logto/node@2.4.5

## 3.2.2

### Patch Changes

- 24d1680: fix: clear access token storage on sign-in
- Updated dependencies [24d1680]
  - @logto/node@2.4.4

## 3.2.1

### Patch Changes

- 76d113f: export more typescript types
- Updated dependencies [76d113f]
  - @logto/node@2.4.3

## 3.2.0

### Minor Changes

- aad00ee: Add error handler to Next.js SDK's withLogtoApiRoute.

### Patch Changes

- @logto/node@2.4.2

## 3.1.2

### Patch Changes

- @logto/node@2.4.1

## 3.1.1

### Patch Changes

- 10f1075: In Next.js SDK, if cookie secure config is set to true, will add "SameSite=Lax"

## 3.1.0

### Minor Changes

- 3575c5c: Add built-in signIn, handleSignIn, singOut, getLogtoContext and other helpers

## 3.0.0

### Major Changes

- 26619ed: remove explicit crypto module imports since Node now has global WebCrypto variable by default

  Marking this as a major change since it may break current code if you are using Node 18. It should be fine if you are using Node LTS. See https://nodejs.org/api/globals.html#crypto_1 for more information.

### Patch Changes

- b71e7c7: The page router SDK will now update cookie when access token changed
- 26619ed: use TypeScript 5.3.3
- Updated dependencies [88495b2]
- Updated dependencies [864caab]
- Updated dependencies [864caab]
- Updated dependencies [26619ed]
  - @logto/node@2.4.0

## 2.4.0

### Minor Changes

- c22000a: Add method of getting Logto Node Client in order to access organization features.

## 2.3.0

### Minor Changes

- 9225576: export useful members from dependency sdk packages

### Patch Changes

- Updated dependencies [9225576]
  - @logto/node@2.2.0

## 2.2.1

### Patch Changes

- 1fb7878: Fix Next.js edge SDK's getContext, pass config to get access token

## 2.2.0

### Minor Changes

- 5cc1342: Add Next.js Server Actions support

## 2.1.4

### Patch Changes

- f9ff6f4: Align the js SDK error type exports.

  - @logto/react: add `LogtoRequestError` export
  - @logto/vue: add `LogtoRequestError` export
  - @logto/express: add logto errors export
  - @logto/next: add logto errors export

- Updated dependencies [f9ff6f4]
  - @logto/node@2.1.2

## 2.1.3

### Patch Changes

- 2ec9146: Fix potential request url mismatch bug

## 2.1.2

### Patch Changes

- 90ef48f: add well-known cache support (unstable)

  - client: support `unstable_cache` in `ClientAdapter`
  - browser, react: add `unstable_enableCache` option to enable a `sessionStorage` cache for well-known data

## 2.1.1

### Patch Changes

- 77480ae: Skip token decode for opaque access token
- Updated dependencies [77480ae]
  - @logto/node@2.1.1

## 2.1.0

### Minor Changes

- 0a533f6: Full edge runtime support

### Patch Changes

- Updated dependencies [0a533f6]
- Updated dependencies [a839b08]
  - @logto/node@2.1.0

## 2.0.0

### Major Changes

- 3aa0913: set package type to ESM, keep CJS build for compatibility (#477)

### Minor Changes

- 3aa0913: support nextjs edge runtime

### Patch Changes

- Updated dependencies [3aa0913]
  - @logto/node@2.0.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [1.1.2](https://github.com/logto-io/js/compare/v1.1.1...v1.1.2) (2023-04-24)

**Note:** Version bump only for package @logto/next

### [1.1.1](https://github.com/logto-io/js/compare/v1.1.0...v1.1.1) (2023-04-11)

**Note:** Version bump only for package @logto/next

## [1.1.0](https://github.com/logto-io/js/compare/v1.0.0...v1.1.0) (2023-03-19)

### Features

- **js:** add interactionMode props to signIn method ([ea763a5](https://github.com/logto-io/js/commit/ea763a59e41251ffad4089df0d6bb876e9901109))

### Bug Fixes

- **js:** add sign-up route handler ([7660524](https://github.com/logto-io/js/commit/7660524c48e086c665e7341892eb56c5f8b9090f))

## [1.0.0](https://github.com/logto-io/js/compare/v1.0.0-rc.0...v1.0.0) (2023-02-28)

**Note:** Version bump only for package @logto/next

## [1.0.0-rc.0](https://github.com/logto-io/js/compare/v1.0.0-beta.15...v1.0.0-rc.0) (2023-02-03)

### Bug Fixes

- remove core-kit dependency and update `engines` ([8a24a87](https://github.com/logto-io/js/commit/8a24a870e7b3891f5e205b3e8a9419535baa7b44))

## [1.0.0-beta.15](https://github.com/logto-io/js/compare/v1.0.0-beta.14...v1.0.0-beta.15) (2023-01-12)

### Bug Fixes

- links in README ([#438](https://github.com/logto-io/js/issues/438)) ([d3acd9c](https://github.com/logto-io/js/commit/d3acd9c6972a0b5fb25e91ac4ce1f39a8bb7ca80))

## [1.0.0-beta.14](https://github.com/logto-io/js/compare/v1.0.0-beta.13...v1.0.0-beta.14) (2022-12-12)

**Note:** Version bump only for package @logto/next

## [1.0.0-beta.13](https://github.com/logto-io/js/compare/v1.0.0-beta.12...v1.0.0-beta.13) (2022-11-08)

### Bug Fixes

- use `.mjs` for ESM files ([#429](https://github.com/logto-io/js/issues/429)) ([2993007](https://github.com/logto-io/js/commit/2993007a0dac3c9ed79e2415fcc55059d2d7a494))

## [1.0.0-beta.12](https://github.com/logto-io/js/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2022-11-02)

**Note:** Version bump only for package @logto/next

## [1.0.0-beta.11](https://github.com/logto-io/js/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2022-10-26)

### Features

- **node,next,express:** get access token with resource ([#420](https://github.com/logto-io/js/issues/420)) ([6fb22ea](https://github.com/logto-io/js/commit/6fb22ea51a50c7a8b1b64cb6d2aa665c18b3a0b8))

## [1.0.0-beta.10](https://github.com/logto-io/js/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2022-10-21)

**Note:** Version bump only for package @logto/next

## [1.0.0-beta.9](https://github.com/logto-io/js/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2022-10-19)

### Features

- **express,next,node:** support fetchUserInfo ([#413](https://github.com/logto-io/js/issues/413)) ([91431d0](https://github.com/logto-io/js/commit/91431d0328d95654928ee86db883884b85120af5))

## [1.0.0-beta.8](https://github.com/logto-io/js/compare/v1.0.0-beta.7...v1.0.0-beta.8) (2022-09-23)

**Note:** Version bump only for package @logto/next

## [1.0.0-beta.7](https://github.com/logto-io/js/compare/v1.0.0-beta.6...v1.0.0-beta.7) (2022-09-20)

### Bug Fixes

- remove persist access token ([#406](https://github.com/logto-io/js/issues/406)) ([f2ba84f](https://github.com/logto-io/js/commit/f2ba84f07e8486e2edf6f35e06446738ea0158e7))

## [1.0.0-beta.6](https://github.com/logto-io/js/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2022-09-17)

**Note:** Version bump only for package @logto/next

## [1.0.0-beta.5](https://github.com/logto-io/js/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2022-09-13)

**Note:** Version bump only for package @logto/next

## [1.0.0-beta.4](https://github.com/logto-io/js/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2022-09-09)

**Note:** Version bump only for package @logto/next

## [1.0.0-beta.3](https://github.com/logto-io/js/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2022-08-22)

**Note:** Version bump only for package @logto/next

## [1.0.0-beta.2](https://github.com/logto-io/js/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2022-08-08)

### Features

- **express:** with logto ([#378](https://github.com/logto-io/js/issues/378)) ([9626b76](https://github.com/logto-io/js/commit/9626b764eb84287a1e29783a768f33190d28411d))

## [1.0.0-beta.1](https://github.com/logto-io/js/compare/v1.0.0-beta.0...v1.0.0-beta.1) (2022-07-25)

### Features

- **next:** handleAuthRoutes ([#367](https://github.com/logto-io/js/issues/367)) ([5bf3a13](https://github.com/logto-io/js/commit/5bf3a133eafc3f93f77fd164352cd779f67a867a))

## [1.0.0-beta.0](https://github.com/logto-io/js/compare/v1.0.0-alpha.3...v1.0.0-beta.0) (2022-07-21)

### Features

- **client:** persist access token ([#359](https://github.com/logto-io/js/issues/359)) ([10fb181](https://github.com/logto-io/js/commit/10fb1813648fd01ad2f0322fafe731e24d354829))
- **next:** add sign in callback route ([#348](https://github.com/logto-io/js/issues/348)) ([80c9e34](https://github.com/logto-io/js/commit/80c9e345e816c4a0cddf0a507c18aa2593a359c5))
- **next:** grant access token and check expiration ([#361](https://github.com/logto-io/js/issues/361)) ([3171b58](https://github.com/logto-io/js/commit/3171b58dae9dd4bc0944349ce39ce038a00960ed))
- **next:** init and sign in route ([#339](https://github.com/logto-io/js/issues/339)) ([f17364a](https://github.com/logto-io/js/commit/f17364ab85d91766a07571b48aea4cb88a4f4461))
- **next:** set getAccessToken as an option ([#364](https://github.com/logto-io/js/issues/364)) ([e27577c](https://github.com/logto-io/js/commit/e27577cef70d6461f03a68006a68cb413294341d))
- **next:** sign out ([#358](https://github.com/logto-io/js/issues/358)) ([f773ce0](https://github.com/logto-io/js/commit/f773ce00c30916ee09351bfb36a71b89e1966065))
- **next:** ssr support ([#363](https://github.com/logto-io/js/issues/363)) ([886e260](https://github.com/logto-io/js/commit/886e2601c7d465e7c980c62ce1707f2d2f74f18f))
- **next:** with logto api route ([#355](https://github.com/logto-io/js/issues/355)) ([60eb143](https://github.com/logto-io/js/commit/60eb143dca87119752f8f9cc1758240c3e3e92eb))
