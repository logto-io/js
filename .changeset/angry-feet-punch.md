---
'@logto/next': minor
---

add getAccessToken and getOrganizationToken methods for pages router

You can now use `getAccessToken(request, response, 'resource-indicator')` to get access token directly in your pages router. And `getOrganizationToken` is also available to get organization token.
