# Auth.js (next-auth) Sample

This is a sample project for integrating Auth.js (next-auth) with Logto.

## Configuration

You can configure the sample project by setting the following environment variables:

| key               | description                                 | example                              |
| ----------------- | ------------------------------------------- | ------------------------------------ |
| AUTH_SECRET       | The secret for cookie encryption            | `my-cookie-secret`                   |
| AUTH_LOGTO_ISSUER | The issuer of your Logto server             | `https://[tenant-id].logto.app/oidc` |
| AUTH_LOGTO_ID     | The client ID of your Logto application     | `my-app`                             |
| AUTH_LOGTO_SECRET | The client secret of your Logto application | `my-secret`                          |

## Run the sample

```bash
pnpm dev
```

## Resources

- [Logto Auth.js Documentation](https://docs.logto.io/quick-starts/next-auth)
