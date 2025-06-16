# Logto React Router SDK

[![Version](https://img.shields.io/npm/v/@logto/react-router)](https://www.npmjs.com/package/@logto/react-router)
[![Build Status](https://github.com/logto-io/js/actions/workflows/main.yml/badge.svg)](https://github.com/logto-io/js/actions/workflows/main.yml)
[![Codecov](https://img.shields.io/codecov/c/github/logto-io/js)](https://app.codecov.io/gh/logto-io/js?branch=master)

The Logto React Router SDK written in TypeScript.

> **Note:** This SDK has been migrated from Remix to React Router. For detailed migration guide, please refer to the [official React Router migration documentation](https://reactrouter.com/upgrading/remix).

## Installation

**Note:** This package requires Node.js version 20 or higher.

### Using npm

```bash
npm install @logto/react-router
```

### Using yarn

```bash
yarn add @logto/react-router
```

### Using pnpm

```bash
pnpm add @logto/react-router
```

## Usage

Before initializing the SDK, we have to create a `SessionStorage` instance which takes care of the session persistence. In our case, we want to use a cookie-based session:

```ts
// services/auth.server.ts
import { makeLogtoReactRouter } from '@logto/react-router';
import { createCookieSessionStorage } from 'react-router';

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'logto-session',
    maxAge: 14 * 24 * 60 * 60,
    secrets: ['secr3tSession'],
  },
});

export const logto = makeLogtoReactRouter(
  {
    endpoint: process.env.LOGTO_ENDPOINT!,
    appId: process.env.LOGTO_APP_ID!,
    appSecret: process.env.LOGTO_APP_SECRET!,
    baseUrl: process.env.LOGTO_BASE_URL!,
  },
  { sessionStorage }
);
```

Whereas the environment variables reflect the respective configuration of the application in Logto.

### Setup file-based routing

```ts
// app/routes.ts
import { type RouteConfig } from '@react-router/dev/routes';
import { flatRoutes } from '@react-router/fs-routes';

export default flatRoutes() satisfies RouteConfig;
```

This will generate the routes for you based on the files in the `app/routes` directory.

### Mounting the authentication route handlers

The SDK ships with a convenient function that mounts the authentication routes: sign-in, sign-in callback and the sign-out route. Create a file `routes/api.logto.$action.ts`

```ts
// routes/api.logto.$action.ts

import { logto } from '../../services/auth.server';

export const loader = logto.handleAuthRoutes({
  'sign-in': {
    path: '/api/logto/sign-in',
    redirectBackTo: '/api/logto/callback',
  },
  'sign-in-callback': {
    path: '/api/logto/callback',
    redirectBackTo: '/',
  },
  'sign-out': {
    path: '/api/logto/sign-out',
    redirectBackTo: '/',
  },
  'sign-up': {
    path: '/api/logto/sign-up',
    redirectBackTo: '/api/logto/callback',
  },
});
```

As you can see, the mount process is configurable and you can adjust it for your particular route structure. The whole URL path structure can be customized via the passed configuration object.

When mounting the routes as described above, you can navigate your browser to `/api/logto/sign-in` and you should be redirected to your Logto instance where you have to authenticate then.

### Get the authentication context

A typical use case is to fetch the _authentication context_ which contains information about the respective user. With that information, it is possible to decide if the user is authenticated or not. The SDK exposes a function that can be used in a React Router `loader` function:

```ts
// app/routes/_index.tsx
import { type LogtoContext } from '@logto/react-router';
import { Link, type LoaderFunctionArgs } from 'react-router';

import { logto } from '../../services/auth.server';

type LoaderResponse = {
  readonly context: LogtoContext;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const context = await logto.getContext({ getAccessToken: false })(request);

  if (!context.isAuthenticated) {
    return redirect('/api/logto/sign-in');
  }

  return { context };
};

const Home = ({ loaderData }: { readonly loaderData: LoaderResponse }) => {
  const { context } = loaderData;
  const { isAuthenticated, claims } = context;

  return <div>Protected Route.</div>;
};
```

## Resources

[![Website](https://img.shields.io/badge/website-logto.io-8262F8.svg)](https://logto.io/)
[![Discord](https://img.shields.io/discord/965845662535147551?logo=discord&logoColor=ffffff&color=7389D8&cacheSeconds=600)](https://discord.gg/UEPaF3j5e6)
