# Logto Nuxt 3 SDK

[![Version](https://img.shields.io/npm/v/@logto/nuxt)](https://www.npmjs.com/package/@logto/nuxt)
[![Build Status](https://github.com/logto-io/js/actions/workflows/main.yml/badge.svg)](https://github.com/logto-io/js/actions/workflows/main.yml)

The Logto Nuxt 3 SDK written in TypeScript.

Check out our [docs](https://docs.logto.io/sdk/nuxt/) for more information.

## Installation

### Using npm

```bash
npm install @logto/nuxt
```

### Using yarn

```bash
yarn add @logto/nuxt
```

### Using pnpm

```bash
pnpm add @logto/nuxt
```

## Get sample

A sample project can be found at [playground](./playground/).

Check out the full JS repo and try it with pnpm.

```bash
pnpm i && pnpm dev
```

The minimal configuration to run the playground is (use `.env` file for example):

```env
NUXT_LOGTO_ENDPOINT=<your-logto-endpoint>
NUXT_LOGTO_APP_ID=<your-logto-app-id>
NUXT_LOGTO_APP_SECRET=<your-logto-app-secret>
NUXT_LOGTO_COOKIE_ENCRYPTION_KEY=<random-string>
```

## Get an access token in the browser

Use the `useLogtoAccessToken` composable when the browser has to call an API directly, for example
an external resource server:

```vue
<script setup lang="ts">
const { refresh, error, pending } = useLogtoAccessToken();

const load = async () => {
  const accessToken = await refresh();

  if (!accessToken) {
    // `not_authenticated` means the session cannot be refreshed; start a sign-in instead of
    // retrying.
    await navigateTo('/sign-in');
    return;
  }

  return $fetch('https://api.example.com/profile', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
};
</script>
```

Pass `resource` and `organizationId` to request a token for a specific API or organization, matching
the server-side `getAccessToken` parameters:

```ts
const { refresh } = useLogtoAccessToken({
  resource: 'https://api.example.com',
  organizationId: 'org_123',
});
```

The composable requests the token from an SDK-managed endpoint, which defaults to
`/api/logto/access-token` and can be changed with the `pathnames.accessToken` module option.

The refresh always runs on the server against the existing session: a still-valid token is reused,
an expired one is exchanged through the refresh token, and the renewed session is written back to
the cookies before the response is returned. The refresh token and the app secret never reach the
browser.

Notes:

- `refresh()` only runs in the browser. During SSR the state stays empty, so no access token is ever
  serialized into the server-rendered payload. Server-side code should use `useLogtoClient()`
  instead, which reads the token straight from the request-scoped client.
- State is shared between every component using the same resource and organization, and concurrent
  `refresh()` calls share a single request.
- When the session is missing or can no longer be refreshed, the endpoint responds with `401` and
  the error code `not_authenticated`, which is available as `NotAuthenticatedErrorCode`.

## Resources

[![Website](https://img.shields.io/badge/website-logto.io-8262F8.svg)](https://logto.io/)
[![Docs](https://img.shields.io/badge/docs-logto.io-green.svg)](https://docs.logto.io/)
[![Discord](https://img.shields.io/discord/965845662535147551?logo=discord&logoColor=ffffff&color=7389D8&cacheSeconds=600)](https://discord.gg/UEPaF3j5e6)
