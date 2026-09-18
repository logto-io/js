---
"@logto/react-router": patch
---

coordinate sessions after in-request persistence

Keep request operations serialized locally, and switch to the configured session coordinator as
soon as storage assigns or rotates a persistent session ID.
