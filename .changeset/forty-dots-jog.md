---
"@logto/next": major
---

remove explicit crypto module imports since Node now has global WebCrypto variable by default

Marking this as a major change since it may break current code if you are using Node 18. It should be fine if you are using Node LTS. See https://nodejs.org/api/globals.html#crypto_1 for more information.
