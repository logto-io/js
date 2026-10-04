# @logto/angular

## 2.1.0

### Minor Changes

- a9dca71: export `decodeAccessToken`, `ReservedResource`, and `CacheKey` from applicable platform SDK package
  roots
- a9dca71: expose token claim APIs across platform SDKs
  
  Make `getIdTokenClaims`, `getAccessTokenClaims`, and `getOrganizationTokenClaims` available through
  Next.js and React Router. Forward the optional `organizationId` through platform access-token
  wrappers.
- 1b9abbd: stabilize cache configuration across JavaScript SDKs
  
  Use the stable `cache` client adapter property. The deprecated `unstable_cache` alias remains
  supported, with the stable property taking precedence. Node and edge clients continue to use an
  endpoint-scoped process-local cache by default.
  
  Browser, React, Angular, Vue, Capacitor, and Chrome Extension clients can opt in through the stable
  `enableCache` option. Browser caches are isolated by endpoint and application, and cache storage
  failures no longer discard successful discovery responses.

### Patch Changes

- 9f877b2: clear local authentication state when remote sign-out cannot start
- Updated dependencies [b694c0e]
- Updated dependencies [a9dca71]
- Updated dependencies [1b9abbd]
- Updated dependencies [9f877b2]
  - @logto/browser@3.1.0

## 2.0.0

### Major Changes

- db682e2: rebuild the Angular SDK on the Logto Browser client

## 1.0.4

### Patch Changes

- Updated dependencies [e4cb17f]
  - @logto/js@6.1.2

## 1.0.3

### Patch Changes

- e8d8c44: bump @silverhand/essentials dependency to v2.9.3, which supports more Node.js versions (18, 20, 22, 24 and 25).
- Updated dependencies [e8d8c44]
  - @logto/js@6.1.1

## 1.0.2

### Patch Changes

- Updated dependencies [1a57720]
  - @logto/js@6.1.0

## 1.0.1

### Patch Changes

- 8391b57: fix angular build script. Remove the `&& pnpm test` operation in the build script to avoid running tests during the build process.

## 1.0.0

### Major Changes

- 3f8d42f: extract Angular-specific utilities from JS package into standalone package

  Check the Angular sample app for usage, replace the existing import (`@logto/js`) with the new package (`@logto/angular`).

### Patch Changes

- Updated dependencies [3f8d42f]
  - @logto/js@6.0.0
