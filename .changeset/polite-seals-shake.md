---
"@logto/js": major
---

allow arbitrary key access for `IdTokenClaims`

Achieve it by appending `& Record<string, unknown>` to the type of `IdTokenClaims`. This usually doesn't break things, but it may cause some type errors when iterating over the object values (e.g. `Object.values(claims)`). Mark it as a breaking change just in case.
