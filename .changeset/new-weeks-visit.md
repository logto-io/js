---
"@logto/js": minor
---

add one-time token to the sign-in URI parameters type definition.

Example usage:

```typescript
signIn({
  redirectUri: 'your-sign-in-redirect-uri',
  // ... other params
  oneTimeToken: 'the-generated-one-time-token',
});
```
