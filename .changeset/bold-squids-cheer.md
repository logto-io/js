---
"@logto/sveltekit": minor
---

add SvelteKit 3 support with an opt-in for external post-sign-in redirects

Set `allowExternalPostRedirectUri: true` in the `handleLogto` hook configuration to allow external `postRedirectUri` values on SvelteKit 3. The option defaults to `false` and does not affect sign-in or sign-out redirects to Logto. SvelteKit 2 retains its existing redirect behavior.
