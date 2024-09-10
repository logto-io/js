---
"@logto/client": patch
---

add react-native package export condition

[Enabling package export](https://reactnative.dev/blog/2023/06/21/package-exports-support#enabling-package-exports-beta) in react-native is unstable and can cause issues.

Replace the `exports` in `@logto/client` package.json with the `react-native` [condition](https://reactnative.dev/blog/2023/06/21/package-exports-support#the-new-react-native-condition).

```json
{
  "react-native": "./lib/shim.js"
}
```

So the `shim.js` module can be used in react-native projects, without enabling the unstable package export feature.
