# @logto/angular

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
