---
"@logto/capacitor": patch
---

fix Android sign-in flow where `browserFinished` fired before `appUrlOpen`, causing successful callbacks to be treated as user cancellations.

Listener handling now waits for the redirect and only cancels when no redirect occurs. Also widen Capacitor peer dependency support to both 7.x and 8.x.
