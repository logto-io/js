---
'@logto/next-server-actions-sample': minor
'@logto/next': minor
---

add getAccessToken to the server actions package

Previously, in order to get access tokens (and organization tokens) in App Router, you'll use `getLogtoContext` with config `{ getAccessToken: true }`, this won't cache the token and will make a network request every time you call it. That is because Next.js does not allow to write cookies in the server side: HTTP does not allow setting cookies after streaming starts, so you must use .set() in a Server Action or Route Handler.

This change adds a new function `getAccessToken` for you to get the access token in a server action or a route handler. It will cache the token and only make a network request when the token is expired.

And also, this change adds a new function `getOrganizationToken` for you to get the organization token.

The original method is deprecated and will be removed in the future.
