---
"@logto/client": patch
"@logto/capacitor": patch
---

reuse persisted access tokens instead of refreshing them on every load

The client loaded persisted access tokens asynchronously in its constructor, and `CapacitorLogtoClient` replaced the storage adapter only after that, so the tokens were read from the default browser storage instead of Capacitor Preferences. The in-memory token map started empty and every app start sent a refresh token grant, even when a valid access token was saved. The client now waits for the persisted tokens before an access token lookup, sign-in token save, or clear, and `CapacitorLogtoClient` reloads them from Preferences after installing its storage.
