---
"@logto/client": minor
---

add new sign-in option to skip clearing cached tokens from storage on sign-in

Example usage:

```typescript
await logtoClient.signIn({ redirectUri, clearTokens: false });
```
