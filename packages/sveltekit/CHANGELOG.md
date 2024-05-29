# @logto/sveltekit

## 0.3.0

### Minor Changes

- dfcfcd6: introduce custom local storage support and error handling for getUserInfo

  1. Introduce a new `storage` option in `hookConfig` that allows a custom local storage to be passed into `logtoClient`. This will supersede the default `CookieStorage` for storing session and token data. If a custom `storage` is provided, the `cookieConfig` settings can be disregarded.
  2. Incorporate a new `onGetUserInfoError` callback in `hookConfig` for custom error handling when `getUserInfo` or `getIdTokenClaims` operations fail. By default, a 500 server error will be thrown.

## 0.2.10

### Patch Changes

- 57894dd: add `svelte` export tag in package.json

  This will provide a hint for `vite-plugin-svelte` to handle `Svelte` libraries in SSR properly.

  - @logto/node@2.5.1

## 0.2.9

### Patch Changes

- Updated dependencies [957a1c9]
  - @logto/node@2.5.0

## 0.2.8

### Patch Changes

- @logto/node@2.4.7

## 0.2.7

### Patch Changes

- @logto/node@2.4.6

## 0.2.6

### Patch Changes

- @logto/node@2.4.5

## 0.2.5

### Patch Changes

- 24d1680: fix: clear access token storage on sign-in
- Updated dependencies [24d1680]
  - @logto/node@2.4.4

## 0.2.4

### Patch Changes

- 76d113f: export more typescript types
- Updated dependencies [76d113f]
  - @logto/node@2.4.3

## 0.2.3

### Patch Changes

- @logto/node@2.4.2

## 0.2.2

### Patch Changes

- @logto/node@2.4.1

## 0.2.1

### Patch Changes

- 0675d61: fix test cases

## 0.2.0

### Minor Changes

- 65fca8c: support `postRedirectUri` to navigate to a URI after sign-in callback

## 0.1.0

### Minor Changes

- 93569a4: add SvleteKit SDK and sample project

### Patch Changes

- Updated dependencies [88495b2]
- Updated dependencies [864caab]
- Updated dependencies [864caab]
- Updated dependencies [26619ed]
  - @logto/node@2.4.0
