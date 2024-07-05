---
"@logto/next": patch
---

support full sign-in options

The `handleSignIn` method now supports direct sign-in, first screen, and extra params. For more information about authentication parameters, see [Authentication parameters](https://docs.logto.io/docs/references/openid-connect/authentication-parameters/).

```ts
client.handleSignIn({
  redirectUri: 'https://example.com',
  directSignIn: {
    method: 'social',
    target: 'google',
  },
  extraParams: {
    foo: 'bar',
  },
});
```
