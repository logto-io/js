---
"@logto/next": minor
---

support custom external session storage

Add `sessionWrapper` to the config, you can implement your own session wrapper to support custom external session storage.

Take a look at the example below:

```ts
import { MemorySessionWrapper } from './storage';

export const config = {
  // ...
  sessionWrapper: new MemorySessionWrapper(),
};
```

```ts
import { randomUUID } from 'node:crypto';

import { type SessionWrapper, type SessionData } from '@logto/next';

export class MemorySessionWrapper implements SessionWrapper {
  private readonly storage = new Map<string, unknown>();

  async wrap(data: unknown, _key: string): Promise<string> {
    const sessionId = randomUUID();
    this.storage.set(sessionId, data);
    return sessionId;
  }

  async unwrap(value: string, _key: string): Promise<SessionData> {
    if (!value) {
      return {};
    }

    const data = this.storage.get(value);
    return data ?? {};
  }
}
```

You can implement your own session wrapper to support custom external session storage like Redis, Memcached, etc.
