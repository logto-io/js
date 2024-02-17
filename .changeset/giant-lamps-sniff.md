---
"@logto/client": minor
---

support custom jwt verifier

Now it's possible to pass a `JwtVerifier` instance to the Logto client adapter to verify the JWT token. The client also has a built-in verifier that keeps the same behavior as before.
