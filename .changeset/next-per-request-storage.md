---
'@logto/next': patch
---

fix concurrent-request race that intermittently reported authenticated users as signed out

`LogtoClient` kept per-request state (the `CookieStorage` and the navigation URL) on instance
fields (`this.storage` / `this.navigateUrl`). Apps instantiate the client as a module-level
singleton, so two requests hitting the SDK concurrently would clobber each other's storage
across the `await storage.init()` yield point: a request could build its Node client with
another request's not-yet-initialized storage, making `getContext()` return
`isAuthenticated: false` (and empty claims) for a fully authenticated user. The shared
`navigate` callback had the same problem, so a sign-in/sign-out could redirect to another
concurrent request's target.

Per-request state is now kept in local variables and threaded through the return value of the
internal `createNodeClient*` helpers, so concurrent requests are fully isolated. This affects
the Pages Router (`@logto/next`), Edge runtime (`@logto/next/edge`), and server-actions
(`@logto/next/server-actions`) entry points.
