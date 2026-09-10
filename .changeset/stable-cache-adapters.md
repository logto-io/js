---
"@logto/angular": minor
"@logto/browser": minor
"@logto/capacitor": minor
"@logto/chrome-extension": minor
"@logto/client": minor
"@logto/node": minor
"@logto/react": minor
"@logto/vue": minor
---

stabilize cache configuration across JavaScript SDKs

Use the stable `cache` client adapter property. The deprecated `unstable_cache` alias remains
supported, with the stable property taking precedence. Node and edge clients continue to use an
endpoint-scoped process-local cache by default.

Browser, React, Angular, Vue, Capacitor, and Chrome Extension clients can opt in through the stable
`enableCache` option. Browser caches are isolated by endpoint and application, and cache storage
failures no longer discard successful discovery responses.
