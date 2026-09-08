---
"@logto/react-router": minor
---

support request-specific post-callback redirects

Pass a resolver as `postCallbackRedirectUri` to derive a same-origin path from the sign-in or
sign-up request. The resolved path is stored in the sign-in session and used after callback
exchange. Callbacks without a stored destination fall back to the application root.
