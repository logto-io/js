---
"@logto/client": patch
---

Fix the bug of granting mutiple organization tokens concurrently.

This is a bug fix for the issue that the client is not able to grant multiple organization tokens concurrently. The issue is caused by the memoize function that caches the organization token request, which leads to the token request being memoized by incorrect key and not being able to be granted concurrently. This fix updates the memoize function to cache by the correct key.
