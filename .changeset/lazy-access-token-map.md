---
"@logto/client": patch
"@logto/capacitor": patch
---

load persisted access tokens on first use

The client loaded persisted access tokens in its constructor, before `CapacitorLogtoClient` replaced the storage adapter with Capacitor Preferences. The tokens were read from the default browser storage instead, so every app start sent a refresh token grant even when a valid access token was saved. The client now loads them on first use and waits for the load before looking up an access token.
