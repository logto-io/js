---
"@logto/client": patch
"@logto/js": patch
---

improve `LogtoRequestError`

- Add `cause` property to `LogtoRequestError` to expose the original response.
- Make `isLogtoRequestError` more reliable by checking the instance of the error and the `name` property.
