---
"@logto/nuxt": minor
---

support client-side access token retrieval with on-demand refresh

Add the `useLogtoAccessToken` composable backed by an SDK-managed endpoint, so browser code can
obtain a valid access token without a page reload or a hand-written token endpoint.

A still-valid token is reused; an expired or missing one is exchanged through the server-side
session, and the renewed session is persisted to the response cookies before the request completes.
The refresh token and the application secret never reach the browser. Concurrent calls for the same
token share a single request, and a session that can no longer be refreshed answers `401` with the
`not_authenticated` error code so the application can start a sign-in instead of retrying.
