---
'@logto/capacitor': patch
---

fix: `signIn()` and `signOut()` in `@logto/capacitor` no longer leave the returned promise unsettled when the underlying flow fails.

- `signIn()` now rejects when the authorization request or `handleSignInCallback()` throws, instead of hanging.
- `signOut()` now rejects when the underlying flow fails — OIDC discovery, token-storage operations, or the in-app browser navigation. Refresh-token revocation failures continue to be swallowed by the base client, as before.
- Listener handles are always removed on every exit path, including failure.

Resolves [#1103](https://github.com/logto-io/js/issues/1103).
