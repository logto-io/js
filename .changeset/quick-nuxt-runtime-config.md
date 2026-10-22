---
"@logto/nuxt": patch
---

import `useRuntimeConfig` from `nitropack/runtime` in the server event handler

This keeps `nuxt build` working when Nitro auto-imports are disabled, such as with
`experimental.nitroAutoImports: false` and `future.compatibilityVersion: 5`.
