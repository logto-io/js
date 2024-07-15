---
"@logto/node": minor
---

return undefined when fetch user info failed in getContext

When `fetchUserInfo` is set to `true`, `useContext()` will call `fetchUserInfo` to get user info. If `fetchUserInfo` failed, it now returns `undefined` in `context.userInfo` instead of throwing an error.

You can check the value of `context.userInfo` to see if the user is authenticated.
