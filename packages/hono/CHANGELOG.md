# @logto/hono

## 0.1.0

### Minor Changes

- 716a3ec: add Hono framework support
  
  Add `handleAuthRoutes` for the standard sign-in, sign-up, callback, and sign-out routes, plus a
  `withLogto` middleware that exposes the Logto context as `c.var.logto`. Sessions are encrypted and
  stored in cookies via `CookieStorage` from `@logto/node`.
