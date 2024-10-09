---
"@logto/next-sample": patch
"@logto/node": patch
---

remove the parameter of crypto, fix global undefined error in edge runtime

Remove the default `crypto` parameter in `unwrapSession` and `wrapSession`, `global.crypto` is unavailable in edge runtime, since Node.js 20, we can access `crypto` directly, this also works in edge runtime like Vercel.
