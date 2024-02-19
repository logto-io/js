---
"@logto/client": minor
---

provide a shim version without importing `jose` (`@logto/client/shim`)

It can avoid the use of `jose` package which is useful for certain environments that don't support native modules like `crypto`. (e.g. React Native)

To use the shim client:

```ts
import { StandardLogtoClient } from '@logto/client/shim';
```

The `StandardLogtoClient` class is identical to the original `LogtoClient` class, except it doesn't have the default JWT verifier implemented.
