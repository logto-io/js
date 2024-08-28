---
"@logto/client": minor
"@logto/js": minor
---

add support for identifier-based and single sign-on first screens and configurable identifiers

You can now set `identifier:sign_in`, `identifier:register`, `single_sign_on` or `reset_password` as the first screen in the sign-in process. Additionally, you can specify which identifiers (`email`, `phone`, `username`) are allowed for `identifier:sign_in`, `identifier:register` and `reset_password` flows.

Note the the original `interactionMode` is now deprecated, please use the new `firstScreen` option instead.

Example (React):
```typescript
signIn({
  redirectUri,
  firstScreen: 'identifier:sign_in',
  identifiers: ['email', 'phone'],
});
```
