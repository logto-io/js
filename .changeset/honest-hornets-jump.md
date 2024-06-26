---
"@logto/nuxt": minor
---

return undefined when fetchUserInfo failed

When `fetchUserInfo` is set to `true`, `useLogto()` will call `fetchUserInfo` to get user info. If `fetchUserInfo` failed, it now returns `undefined` instead of throwing an error.

You can check the value of `userLogto()` to see if the user is authenticated.
