---
'@logto/client': minor
'@logto/next': minor
---

add a supported way to force-refresh access tokens and organization tokens

Access tokens (including organization tokens) are cached in the session until they expire, so a
cached token keeps its original scopes even after the user's organization roles have changed on
the Logto side. Since Logto re-reads the user's organization scopes from the database on every
`refresh_token` exchange, a fresh token already reflects role changes immediately — there was
just no supported way to trigger that exchange from `@logto/next`.

Two additions:

- `getAccessToken()` / `getOrganizationToken()` now accept an optional
  `{ forceRefresh: boolean }` argument. When `true`, the cached token is skipped and a new one is
  exchanged with the Refresh Token.
- `clearAccessToken()` now accepts optional `resource` / `organizationId` arguments to evict a
  single cached token instead of all of them. Calling it with no arguments keeps the existing
  "clear everything" behavior.

Both are exposed through `@logto/next` for the Pages Router, the Edge runtime, and server
actions, where `clearAccessToken(config, resource?, organizationId?)` is now exported from
`@logto/next/server-actions`.

Note that a token can still only carry scopes that were requested in the original authorization
request. Introducing a brand new scope continues to require a new authorization request, e.g.
`signIn({ prompt: 'consent' })`.
