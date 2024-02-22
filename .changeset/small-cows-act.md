---
"@logto/node": patch
---

remove `node-fetch` from dependencies (native fetch is available from [Node.js v17.5.0](https://nodejs.org/dist/latest-v18.x/docs/api/globals.html#fetch), we are targeting v20+)
