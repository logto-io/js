---
"@logto/browser": minor
"@logto/client": minor
"@logto/react": minor
"@logto/browser-sample": patch
"@logto/react-sample": patch
"@logto/express": patch
"@logto/remix": patch
"@logto/next": patch
---

add well-known cache support (unstable)

- client: support `unstable_cache` in `ClientAdapter`
- browser, react: add `unstable_enableCache` option to enable a `sessionStorage` cache for well-known data
