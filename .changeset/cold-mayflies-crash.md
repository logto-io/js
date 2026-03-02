---
"@logto/js": patch
---

indroduce new user scope urn:logto:scope:sessions

This new `User.sessions` scope is used for session management account API permission control. It does not include any claims in ID token or userinfo endpoint, as it's not meant for user information retrieval but rather for controlling access to session management features.
