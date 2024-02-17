---
"@logto/js": patch
---

use `.toString()` for `URLSearchParams` passing to requester

Some `fetch` implementation doesn't support `URLSearchParams` directly, so we need to convert it to string before passing it to the requester.
