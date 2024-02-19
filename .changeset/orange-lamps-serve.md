---
"@logto/client": patch
---

refactor adapter types

- `generateState()`, `generateCodeVerifier()`, `generateCodeChallenge()` now accept both Promise and non-Promise return types.
- the navigate function now calls with a second parameter which has the state information. (`{ redirectUri?: string; for: 'sign-in' | 'sign-out' }`)
