---
"@logto/nuxt": patch
---

fix the default value of customRedirectBaseUrl

Previously, it was set to '<replace-with-custom-redirect-base-url>', which is not a valid value. Now the default value is removed because it's not a required value.
