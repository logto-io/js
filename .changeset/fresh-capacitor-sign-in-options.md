---
"@logto/capacitor": minor
---

support object-form sign-in options

Support the existing object-form sign-in options API. Post-sign-in navigation now reloads the
current WebView, and a browser that has already closed no longer causes a successful sign-in or
sign-out flow to reject.
