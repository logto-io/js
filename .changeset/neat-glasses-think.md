---
"@logto/browser": patch
---

support ssr for browser-based SDKs

Check if the `window` is defined, if not, ignore the storage operations, avoid breaking the server side rendering.

For this kind of SDKs, it doesn't make sense to be used in server side, because the auth state is usually stored in the client side which is not available in server side. So we can safely ignore the storage operations in server side.
