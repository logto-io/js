---
"@logto/client": patch
"@logto/node": patch
"@logto/react-router": major
---

export `FirstScreen` and update the React Router type surface

React Router users should replace `InteractionMode` imports with `FirstScreen`. The client and Node
SDKs retain `InteractionMode` for compatibility.
