---
"@logto/react": major
---

refactor LogtoContextProps and LogtoContext

This version marks as major because it changes the exported `LogtoContextProps` type. In most cases, this should not affect you.

- Removed `loadingCount` and `setLoadingCount` from `LogtoContextProps`.
- Added `isLoading` and `setIsLoading` to `LogtoContextProps`.
- Export `LogtoContext`.
