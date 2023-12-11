---
"@logto/react": patch
---

refactor `useHandleSignInCallback()`

- check `isLoading` and `error`  before calling the client callback handler to prevent unnecessary calls (e.g. in React strict mode)
