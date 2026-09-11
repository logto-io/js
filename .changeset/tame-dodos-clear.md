---
"@logto/next": minor
"@logto/react-router": minor
---

expose token clearing APIs in Next.js and React Router

Add `clearAccessToken` and `clearAllTokens` to Next.js server APIs and the React Router request
context. Persist the resulting session changes through each framework's cookie response mechanism.
