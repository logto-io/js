---
"@logto/next": minor
"@logto/react-router": minor
"@logto/angular": minor
"@logto/client": minor
"@logto/node": minor
---

expose token claim APIs across platform SDKs

Make `getIdTokenClaims`, `getAccessTokenClaims`, and `getOrganizationTokenClaims` available through
Next.js and React Router. Forward the optional `organizationId` through platform access-token
wrappers.
