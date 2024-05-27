---
"@logto/sveltekit": minor
---

introduce custom local storage support and error handling for getUserInfo

1. 1. Introduce a new `storage` option in `hookConfig` that allows a custom local storage to be passed into `logtoClient`. This will supersede the default `CookieStorage` for storing session and token data. If a custom `storage` is provided, the `cookieConfig` settings can be disregarded.

2. Incorporate a new `onGetUserInfoError` callback in `hookConfig` for custom error handling when `getUserInfo` or `getIdTokenClaims` operations fail. By default, a 500 server error will be thrown.
