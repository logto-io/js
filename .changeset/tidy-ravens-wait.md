---
"@logto/client": minor
---

support configurable request timeouts and optional fetch adapters

Set `requestTimeoutMs` in `LogtoConfig` to apply a timeout to Logto discovery, token, revocation,
user-info, and remote JSON Web Key Set requests. Existing request abort signals are preserved.

`ClientAdapter` uses native `fetch` by default and accepts an optional custom `fetch` transport so
the client can consistently apply shared request policies. Existing `requester` adapters remain
supported but are deprecated. When both are provided, `fetch` takes precedence.
