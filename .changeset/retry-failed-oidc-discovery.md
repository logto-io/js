---
'@logto/client': patch
---

retry OIDC discovery after a failed request instead of failing for the client's lifetime

The discovery result was cached by a plain `once()`, which has no rejection path, so a rejected promise was memoized permanently and replayed to every later caller. If the very first discovery of a client failed (for example, the app started while offline), every operation that needs the OpenID configuration — `getAccessToken`, `getOrganizationToken`, `fetchUserInfo`, `signIn`, `signOut` and ID token verification — kept failing with the original error and no further network request was ever made. Recovering required constructing a new client, which in a browser app means a page reload.

The successful path is unchanged: discovery is still fetched at most once per client.
