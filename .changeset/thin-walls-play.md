---
"@logto/client": minor
---

- support clock tolerance config in `DefaultJwtVerifier`
- allow set `jwtVerifier` after `LogtoClient` instance created

```ts
const client = new LogtoClient(
  config,
  adapters,
  (client) => new DefaultJwtVerifier(client, { clockTolerance: 10 })
);

client.setJwtVerifier(new DefaultJwtVerifier(client, { clockTolerance: 20 }));
```
