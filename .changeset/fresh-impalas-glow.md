---
"@logto/client": minor
"@logto/node": minor
---

Add organizationId param to getAccessTokenClaims function.

You can now pass an organizationId to the getAccessTokenClaims function, and this will be passed down to the getAccessToken function. This allows you to get the access token claims with scopes inherited from the specific organization.
