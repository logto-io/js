---
"@logto/react-router": major
---

replace legacy React Router handlers with a Framework Mode middleware API

Create the integration with `createLogtoReactRouter()`, register `logto.middleware`, and mount
authentication routes with `logto.authRoutes()`. Export its callback `loader` and mutation `action`;
sign-in, sign-up, and sign-out now require `POST`. Read authentication from `logto.context`; explicit
token methods now persist refreshed sessions safely.
