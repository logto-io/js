# @logto/react-router

## 2.0.0

### Major Changes

- db78ef4: require Node.js 22 or later for server-side SDKs
- 3b32030: export `FirstScreen` and update the React Router type surface
  
  React Router users should replace `InteractionMode` imports with `FirstScreen`. The client and Node
  SDKs retain `InteractionMode` for compatibility.
- 6a98d63: replace legacy React Router handlers with a Framework Mode middleware API
  
  Create the integration with `createLogtoReactRouter()`, register `logto.middleware`, and mount
  authentication routes with `logto.authRoutes()`. Export its callback `loader` and mutation `action`;
  sign-in, sign-up, and sign-out now require `POST`. Read authentication from `logto.context`; explicit
  token methods now persist refreshed sessions safely.
  
  The new API supports React Router 7.15 and React Router 8.

### Minor Changes

- f335935: support request-specific post-callback redirects
  
  Pass a resolver as `postCallbackRedirectUri` to derive a same-origin path from the sign-in or
  sign-up request. The resolved path is stored in the sign-in session and used after callback
  exchange. Callbacks without a stored destination fall back to the application root.
- a9dca71: export `decodeAccessToken`, `ReservedResource`, and `CacheKey` from applicable platform SDK package
  roots
- a9dca71: expose token claim APIs across platform SDKs
  
  Make `getIdTokenClaims`, `getAccessTokenClaims`, and `getOrganizationTokenClaims` available through
  Next.js and React Router. Forward the optional `organizationId` through platform access-token
  wrappers.
- 1cfbfd2: expose token clearing APIs in Next.js and React Router
  
  Add `clearAccessToken` and `clearAllTokens` to Next.js server APIs and the React Router request
  context. Persist the resulting session changes through each framework's cookie response mechanism.

### Patch Changes

- e5f3817: keep coordination request-local until a new persistent session reaches the browser
- 9f877b2: clear local authentication state when remote sign-out cannot start
- Updated dependencies [b694c0e]
- Updated dependencies [a078735]
- Updated dependencies [db78ef4]
- Updated dependencies [3b32030]
- Updated dependencies [a9dca71]
- Updated dependencies [a9dca71]
- Updated dependencies [1b9abbd]
- Updated dependencies [9f877b2]
  - @logto/node@4.0.0

## 1.0.5

### Patch Changes

- Updated dependencies [f09212f]
  - @logto/node@3.1.11

## 1.0.4

### Patch Changes

- @logto/node@3.1.10

## 1.0.3

### Patch Changes

- Updated dependencies [e8d8c44]
  - @logto/node@3.1.9

## 1.0.2

### Patch Changes

- @logto/node@3.1.8

## 1.0.1

### Patch Changes

- @logto/node@3.1.7

## 1.0.0

### Major Changes

- 7f23644: add react-router SDK

  Migrate from Remix to React Router, please refer to the [official React Router migration documentation](https://reactrouter.com/upgrading/remix).

  And you can check the new sample project to see how to use the SDK.

### Patch Changes

- @logto/node@3.1.6
