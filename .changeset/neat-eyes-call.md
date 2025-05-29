---
"@logto/angular": patch
---

fix angular build script. Remove the `&& pnpm test` operation in the build script to avoid running tests during the build process.
