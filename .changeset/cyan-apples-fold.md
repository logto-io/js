---
"@logto/client": patch
---

Add backward time shift to local storage cached `expiresAt`, to ensure it is always smaller than the actual `exp` timestamp in access token claims
