---
"@logto/client": patch
---

refactor method execution

- `getOidcConfig()` will only run once
- `handleSignInCallback()` is now memoized to prevent unnecessary calls (e.g. in React strict mode)
