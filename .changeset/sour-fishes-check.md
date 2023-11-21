---
"@logto/client": minor
---

add organizations support

- add `getOrganizationToken()` and `getOrganizationTokenClaims()` to `LogtoClient`
- automatically add organization resource to configuration when `scopes`` contains organization scope
