# @logto/angular

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
