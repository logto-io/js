---
"@logto/client": patch
---

fix request error handler

Clone the response object before consuming it to avoid the unexpected "Body has already been consumed." error.
