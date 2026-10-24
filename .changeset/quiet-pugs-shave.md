---
"@logto/client": patch
"@logto/react": patch
"@logto/vue": patch
---

fix `clearTokens: false` sign-in callback handling

The client now clears the access tokens cached for the previous session once the sign-in callback's
ID token is verified, so resource and organization tokens kept by `signIn({ clearTokens: false })`
are not reused for the new session. If the callback fails before the ID token is verified, the
previous tokens remain untouched.

The React and Vue SDKs now handle the sign-in callback when the user is already authenticated, which
is the case with `signIn({ clearTokens: false })`, and reset the authentication state after
`clearAllTokens()`.
