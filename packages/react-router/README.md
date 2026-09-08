# Logto React Router SDK

[![Version](https://img.shields.io/npm/v/@logto/react-router)](https://www.npmjs.com/package/@logto/react-router)
[![Build Status](https://github.com/logto-io/js/actions/workflows/main.yml/badge.svg)](https://github.com/logto-io/js/actions/workflows/main.yml)
[![Codecov](https://img.shields.io/codecov/c/github/logto-io/js)](https://app.codecov.io/gh/logto-io/js?branch=master)

The Logto SDK for server-rendered React Router applications.

This package uses React Router Framework Mode middleware to keep Logto session state consistent
across loaders, actions, authentication callbacks, and access-token refreshes. Enable middleware in
your React Router config:

```ts
// react-router.config.ts
import type { Config } from '@react-router/dev/config';

export default {
  ssr: true,
  future: {
    v8_middleware: true,
  },
} satisfies Config;
```

## Installation

This package requires Node.js 20 or later and React Router 7.9.1 or later.

```bash
pnpm add @logto/react-router
```

## Configure Logto

Create a React Router `SessionStorage`, then initialize the SDK:

```ts
// app/services/auth.server.ts
import { createLogtoReactRouter } from '@logto/react-router';
import { createCookieSessionStorage } from 'react-router';

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'logto-session',
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60,
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET!],
    secure: process.env.NODE_ENV === 'production',
  },
});

export const logto = createLogtoReactRouter(
  {
    endpoint: process.env.LOGTO_ENDPOINT!,
    appId: process.env.LOGTO_APP_ID!,
    appSecret: process.env.LOGTO_APP_SECRET!,
    baseUrl: process.env.LOGTO_BASE_URL!,
  },
  { sessionStorage }
);
```

Add the middleware to the root route so every server request shares one request-scoped Logto
context and session runtime:

```tsx
// app/root.tsx
import type { MiddlewareFunction } from 'react-router';

import { logto } from './services/auth.server';

export const middleware = [logto.middleware] satisfies Array<MiddlewareFunction<Response>>;
```

## Authentication routes

Mount the sign-in, sign-up, callback, and sign-out paths in one route module:

```ts
// app/routes/api.logto.$action.ts
import { logto } from '../services/auth.server';

const authRoutes = logto.authRoutes({
  paths: {
    signIn: '/api/logto/sign-in',
    signUp: '/api/logto/sign-up',
    callback: '/api/logto/callback',
    signOut: '/api/logto/sign-out',
  },
  postCallbackRedirectUri: '/',
  postSignOutRedirectUri: '/',
});

export const loader = authRoutes.loader;
export const action = authRoutes.action;
```

Each `paths` entry is an absolute pathname matching the deployed application URL. Omit `signUp` if
the application does not expose a sign-up route. The post-callback and post-sign-out URIs are
resolved against `baseUrl`. The callback accepts `GET`; sign-in, sign-up, and sign-out accept only
`POST`. Requests using the wrong method receive a `405 Method Not Allowed` response.

Initiate sign-in and sign-out with a form:

```tsx
import { Form } from 'react-router';

export const SignInButton = () => (
  <Form action="/api/logto/sign-in" method="post">
    <button type="submit">Sign In</button>
  </Form>
);
```

POST routes should also validate the request origin or a CSRF token when they use cookie sessions.
Use `validateActionRequest` to apply the application's policy before Logto changes the session. For
example, a same-origin validator can reject cross-origin form submissions:

```ts
const applicationOrigin = new URL(process.env.LOGTO_BASE_URL!).origin;

const validateActionRequest = (request: Request) => {
  if (request.headers.get('Origin') !== applicationOrigin) {
    return new Response(null, { status: 403, statusText: 'Forbidden' });
  }
};
```

Pass this function as the `validateActionRequest` option of `logto.authRoutes()`.

The callback exchanges the authorization code and commits the resulting Logto session before it
redirects. If your app provisions application data after sign-in, set `postCallbackRedirectUri` to
a dedicated provisioning route. That route can retry provisioning without repeating the code
exchange.

## Read authentication state

Access the request context from a loader or action:

```ts
// app/routes/dashboard.tsx
import { redirect } from 'react-router';

import type { Route } from './+types/dashboard';
import { logto } from '../services/auth.server';

export const loader = async ({ context }: Route.LoaderArgs) => {
  const authentication = await context.get(logto.context).getContext();

  if (!authentication.isAuthenticated) {
    // Redirect to an application page containing the POST sign-in form.
    return redirect('/sign-in');
  }

  return { authentication };
};
```

Pass `{ fetchUserInfo: true }` to fetch the current user info. Token acquisition is explicit because
it can refresh and rotate session credentials:

```ts
export const loader = async ({ context }: Route.LoaderArgs) => {
  const logtoContext = context.get(logto.context);
  const authentication = await logtoContext.getContext();

  if (!authentication.isAuthenticated) {
    return redirect('/sign-in');
  }

  const accessToken = await logtoContext.getAccessToken({
    resource: 'https://api.example.com',
  });

  return { accessToken };
};
```

Use `getOrganizationToken(organizationId)` when you need an organization token.

## Session coordination

The default `ProcessLocalSessionCoordinator` serializes writes for the same stable session ID in a
single server process. This protects concurrent refresh-token rotation when `SessionStorage`
returns reloadable server-side sessions.

Cookie-only storage returns sessions without a stable ID, so it cannot coordinate refreshes across
requests. It is suitable for simple deployments, but applications that need concurrent refresh
coordination should use shared server-side session storage.

For a multi-instance deployment, use both:

- shared server-side `SessionStorage` that returns stable session IDs; and
- a distributed implementation of `SessionCoordinator`, passed as `sessionCoordinator` when you
  call `createLogtoReactRouter`.

The storage keeps session state shared. The coordinator provides mutual exclusion for refresh and
persistence operations that use the same session ID.

## Migrating from 1.x

This release removes the legacy request-handler API. The main changes are:

- replace `makeLogtoReactRouter` with `createLogtoReactRouter`;
- enable Framework Mode middleware and export `logto.middleware` from the root route;
- replace `handleAuthRoutes` with `authRoutes` and export its `loader` and `action`;
- submit sign-in, sign-up, and sign-out using `POST` forms;
- replace `logto.getContext(options)(request)` with
  `context.get(logto.context).getContext(options)`; and
- call `getAccessToken` or `getOrganizationToken` explicitly instead of requesting tokens through
  `getContext`.

## Resources

[![Website](https://img.shields.io/badge/website-logto.io-8262F8.svg)](https://logto.io/)
[![Discord](https://img.shields.io/discord/965845662535147551?logo=discord&logoColor=ffffff&color=7389D8&cacheSeconds=600)](https://discord.gg/UEPaF3j5e6)
