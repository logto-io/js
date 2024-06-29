---
"@logto/nuxt": minor
---

use `trySafe` for all `context.logtoUser` methods

All `context.logtoUser` methods now use the `trySafe` function to prevent errors from crashing the server.
