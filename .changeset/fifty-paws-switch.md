---
"@logto/client": patch
---

reuse `getAccessToken()` Promise when there's an ongoing one to avoid multiple calls to the server
