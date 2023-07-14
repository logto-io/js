---
"@logto/client": patch
---

Use `requestedAt` + `expiresIn` to calculate an approximately `expiredAt` timestamp, in order to ensure it is always smaller than the actual `exp` timestamp in access token claims.
