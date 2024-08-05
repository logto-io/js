---
"@logto/next-server-actions-sample": minor
"@logto/next": minor
---

add getAccessTokenRSC to the server actions package

Introduced two new asynchronous functions, getAccessTokenRSC and getOrganizationTokenRSC, designed to retrieve access tokens within React Server Components (RSC) environments. These functions facilitate token management in a server-side context without updating the session, since in RSC cookies are not writable.