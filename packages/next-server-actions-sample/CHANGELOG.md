# next-server-actions-sample

## 2.3.11

### Patch Changes

- Updated dependencies [a0f91a3]
  - @logto/next@4.2.0

## 2.3.10

### Patch Changes

- Updated dependencies [8c352b5]
  - @logto/next@4.1.0

## 2.3.9

### Patch Changes

- 1fb33d0: force bump for republish
- Updated dependencies [1fb33d0]
  - @logto/next@4.0.3

## 2.3.8

### Patch Changes

- @logto/next@4.0.2

## 2.3.7

### Patch Changes

- 28bc32e: force bump for republish
- Updated dependencies [28bc32e]
  - @logto/next@4.0.1

## 2.3.6

### Patch Changes

- Updated dependencies [9fa75c6]
  - @logto/next@4.0.0

## 2.3.5

### Patch Changes

- @logto/next@3.7.2

## 2.3.4

### Patch Changes

- @logto/next@3.7.1

## 2.3.3

### Patch Changes

- Updated dependencies [8ca35ed]
  - @logto/next@3.7.0

## 2.3.2

### Patch Changes

- @logto/next@3.6.1

## 2.3.1

### Patch Changes

- Updated dependencies [5610505]
  - @logto/next@3.6.0

## 2.3.0

### Minor Changes

- 9142c6c: add getAccessTokenRSC to the server actions package

  Introduced two new asynchronous functions, getAccessTokenRSC and getOrganizationTokenRSC, designed to retrieve access tokens within React Server Components (RSC) environments. These functions facilitate token management in a server-side context without updating the session, since in RSC cookies are not writable.

### Patch Changes

- Updated dependencies [9142c6c]
  - @logto/next@3.5.0

## 2.2.0

### Minor Changes

- a40b28f: add getAccessToken to the server actions package

  Previously, in order to get access tokens (and organization tokens) in App Router, you'll use `getLogtoContext` with config `{ getAccessToken: true }`, this won't cache the token and will make a network request every time you call it. That is because Next.js does not allow to write cookies in the server side: HTTP does not allow setting cookies after streaming starts, so you must use .set() in a Server Action or Route Handler.

  This change adds a new function `getAccessToken` for you to get the access token in a server action or a route handler. It will cache the token and only make a network request when the token is expired.

  And also, this change adds a new function `getOrganizationToken` for you to get the organization token.

  The original method is deprecated and will be removed in the future.

### Patch Changes

- Updated dependencies [a40b28f]
- Updated dependencies [ff8bcbb]
  - @logto/next@3.4.0

## 2.1.21

### Patch Changes

- Updated dependencies [5f64e0e]
  - @logto/next@3.3.4

## 2.1.20

### Patch Changes

- @logto/next@3.3.3

## 2.1.19

### Patch Changes

- @logto/next@3.3.2

## 2.1.18

### Patch Changes

- @logto/next@3.3.1

## 2.1.17

### Patch Changes

- Updated dependencies [e888a7c]
  - @logto/next@3.3.0

## 2.1.16

### Patch Changes

- Updated dependencies [917158c]
  - @logto/next@3.2.7

## 2.1.15

### Patch Changes

- Updated dependencies [cf524a0]
  - @logto/next@3.2.6

## 2.1.14

### Patch Changes

- @logto/next@3.2.5

## 2.1.13

### Patch Changes

- @logto/next@3.2.4

## 2.1.12

### Patch Changes

- @logto/next@3.2.3

## 2.1.11

### Patch Changes

- Updated dependencies [24d1680]
  - @logto/next@3.2.2

## 2.1.10

### Patch Changes

- Updated dependencies [76d113f]
  - @logto/next@3.2.1

## 2.1.9

### Patch Changes

- Updated dependencies [aad00ee]
  - @logto/next@3.2.0

## 2.1.8

### Patch Changes

- @logto/next@3.1.2

## 2.1.7

### Patch Changes

- Updated dependencies [10f1075]
  - @logto/next@3.1.1

## 2.1.6

### Patch Changes

- Updated dependencies [3575c5c]
  - @logto/next@3.1.0

## 2.1.5

### Patch Changes

- 26619ed: use TypeScript 5.3.3
- Updated dependencies [26619ed]
- Updated dependencies [b71e7c7]
- Updated dependencies [26619ed]
  - @logto/next@3.0.0

## 2.1.4

### Patch Changes

- Updated dependencies [c22000a]
  - @logto/next@2.4.0

## 2.1.3

### Patch Changes

- 8d693a3: explicitly cast claim value type to adopt the new claim type definition
- Updated dependencies [9225576]
  - @logto/next@2.3.0

## 2.1.2

### Patch Changes

- Updated dependencies [1fb7878]
  - @logto/next@2.2.1

## 2.1.1

### Patch Changes

- Updated dependencies [5cc1342]
  - @logto/next@2.2.0
