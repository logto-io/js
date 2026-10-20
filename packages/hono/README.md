# Logto Hono SDK

[![Version](https://img.shields.io/npm/v/@logto/hono)](https://www.npmjs.com/package/@logto/hono)
[![Build Status](https://github.com/logto-io/js/actions/workflows/main.yml/badge.svg)](https://github.com/logto-io/js/actions/workflows/main.yml)
[![Codecov](https://img.shields.io/codecov/c/github/logto-io/js)](https://app.codecov.io/gh/logto-io/js?branch=master)

The Logto Hono SDK written in TypeScript.

Check out our [docs](https://docs.logto.io/) for more information.

## Installation

### Using npm

```bash
npm install @logto/hono hono
```

### Using yarn

```bash
yarn add @logto/hono hono
```

### Using pnpm

```bash
pnpm add @logto/hono hono
```

## Usage

```ts
import type { LogtoHonoConfig, LogtoVariables } from '@logto/hono';
import { handleAuthRoutes, withLogto } from '@logto/hono';
import { Hono } from 'hono';

const config: LogtoHonoConfig = {
  endpoint: 'https://your-logto-endpoint',
  appId: 'your-app-id',
  appSecret: 'your-app-secret',
  baseUrl: 'http://localhost:3000',
  // A long random string used to encrypt the session cookie.
  encryptionKey: process.env.LOGTO_COOKIE_ENCRYPTION_KEY ?? 'replace-with-a-random-string',
};

const app = new Hono<{ Variables: LogtoVariables }>();

// Adds `/logto/sign-in`, `/logto/sign-up`, `/logto/sign-in-callback`, and `/logto/sign-out`.
app.route('/', handleAuthRoutes(config));

// `withLogto` exposes the Logto context as `c.var.logto`.
app.get('/user', withLogto(config), (c) => c.json(c.var.logto));

app.get('/protected', withLogto(config), (c) => {
  if (!c.var.logto.isAuthenticated) {
    return c.redirect('/logto/sign-in');
  }

  return c.text('protected resource');
});
```

Serve `app` with the adapter for your runtime, such as `@hono/node-server`, Bun, or Cloudflare
Workers.

The auth routes use the `logto` prefix by default. Use `authRoutesPrefix` to change it, and register
`${baseUrl}/${authRoutesPrefix}/sign-in-callback` as the redirect URI in Logto Console.

### Session storage

Sessions are stored in an encrypted, HTTP-only cookie using `CookieStorage` from `@logto/node`. You
must provide an `encryptionKey`; use `cookieKey` to change the cookie name (defaults to
`logtoCookies`). The cookie is marked `Secure` when the request is served over HTTPS, including
requests with an `x-forwarded-proto: https` header.

The Logto client is created from the edge build of `@logto/node` (`@logto/node/edge`), so the SDK
works on Bun and edge runtimes.

### Request-specific sign-in options

Use `signInOptions` for defaults shared by every sign-in. Add `getSignInOptions` when an individual
request needs to override them:

```ts
import { handleAuthRoutes, Prompt } from '@logto/hono';

app.route(
  '/',
  handleAuthRoutes(
    {
      ...config,
      signInOptions: { prompt: Prompt.Login },
    },
    {
      getSignInOptions: (c, flow) => {
        const prompt = c.req.query('prompt');

        return flow === 'signIn' && prompt === 'consent' ? { prompt: Prompt.Consent } : {};
      },
    }
  )
);
```

Resolver values override `signInOptions`. The SDK manages callback redirect fields and forces the
registration screen for the sign-up route. Validate or allowlist request input before copying it
into sign-in options. `getSignInOptions` receives a regular Hono context; the `logto` variable is
not set on the auth routes.

### Fetching user info and tokens

`withLogto` accepts the same context options as `@logto/node`'s `getContext`:

```ts
app.get(
  '/user',
  withLogto({
    ...config,
    fetchUserInfo: true,
    getAccessToken: true,
    getOrganizationToken: true,
  }),
  (c) => c.json(c.var.logto)
);
```

## Cloudflare Workers

`CookieStorage` currently relies on `Buffer` when encrypting the session. To run the SDK on
Cloudflare Workers, enable the [`nodejs_compat`](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)
compatibility flag.

## Resources

[![Website](https://img.shields.io/badge/website-logto.io-8262F8.svg)](https://logto.io/)
[![Docs](https://img.shields.io/badge/docs-logto.io-green.svg)](https://docs.logto.io/)
[![Discord](https://img.shields.io/discord/965845662535147551?logo=discord&logoColor=ffffff&color=7389D8&cacheSeconds=600)](https://discord.gg/UEPaF3j5e6)
