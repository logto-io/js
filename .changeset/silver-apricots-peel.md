---
"@logto/js": major
---

remove `verifyIdToken()` util function, now it's in `@logto/client`

This change removes the dependency of `jose` which keeps the package clean.
