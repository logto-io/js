---
"@logto/nuxt": major
---

add support for secure cookie storage in Nuxt SDK and improve security handling

This is a breaking change that enhances security but requires manual configuration:

- Introduce new `cookieSecure` configuration option to set whether Logto cookie should be secure
- Remove automatic HTTPS detection based on Request URL and headers
- No longer trust `x-forwarded-proto` or similar headers by default for security reasons

Previously, the SDK would automatically determine whether to use secure cookies based on the Request URL and headers. This automatic detection has been removed to prevent potential security vulnerabilities, especially in environments using reverse proxies or load balancers.

Now, users must explicitly configure the `cookieSecure` option based on their deployment environment. This change gives users more control and ensures that secure cookies are used only when explicitly configured.

It's strongly recommended to set `cookieSecure` to `true` when using HTTPS, especially in production environments.

Usage example:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@logto/nuxt'],
  logto: {
    cookieSecure: true, // Enable secure cookie in HTTPS environments
  },
});
```
