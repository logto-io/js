# Logto Remix SDK
[![Version](https://img.shields.io/npm/v/@logto/remix)](https://www.npmjs.com/package/@logto/remix)
[![Build Status](https://github.com/logto-io/js/actions/workflows/main.yml/badge.svg)](https://github.com/logto-io/js/actions/workflows/main.yml)
[![Codecov](https://img.shields.io/codecov/c/github/logto-io/js)](https://app.codecov.io/gh/logto-io/js?branch=master)

The Logto Remix SDK written in TypeScript.

## Installation

### Using npm

```bash
npm install @logto/remix
```

### Using yarn

```bash
yarn add @logto/remix
```

### Using pnpm

```bash
pnpm add @logto/remix
```

## Usage

Before initializing the SDK, we have to create a `SessionStorage` instance which takes care of the session persistence. In our case, we want to use a cookie-based session:

```ts
// services/authentication.ts
import { createCookieSessionStorage } from "@remix-run/node";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "logto-session",
    maxAge: 14 * 24 * 60 * 60,
    secrets: ["s3cret1"],
  },
});
```

Afterwards, we can initialize the SDK via:

```ts
// app/services/authentication.ts

import { makeLogtoRemix } from "@logto/remix";

export const logto = makeLogtoRemix(
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

### Mounting the authentication route handlers

The SDK ships with a convenient function that mounts the authentication routes: sign-in, sign-in callback and the sign-out route:

```ts
// app/routes/api/logto/$action.ts

import { logto } from "../../../services/authentication";

export const loader = logto.handleAuthRoutes({
  "sign-in": {
    path: "/api/logto/sign-in",
    redirectBackTo: "/api/logto/callback",
  },
  "sign-in-callback": {
    path: "/api/logto/callback",
    redirectBackTo: "/",
  },
  "sign-out": {
    path: "/api/logto/sign-out",
    redirectBackTo: "/",
  },
});
```

As you can see, the mount process is configurable and you can adjust it for your particular route structure. The whole URL path structure can be customized via the passed configuration object.

When mounting the routes as described above, you can navigate your browser to `/api/logto/sign-in` and you should be redirected to your Logto instance where you have to authenticate then.

### Get the authentication context

A typical use case is to fetch the _authentication context_ which contains information about the respective user. With that information, it is possible to decide if the user is authenticated or not. The SDK exposes a function that can be used in a Remix `loader` function:

```ts
// app/routes/index.tsx
import type { LogtoContext } from "@logto/remix";
import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { logto } from "~/services/authentication";

type LoaderResponse = {
  readonly context: LogtoContext;
};

export const loader: LoaderFunction = async ({ request }) => {
  const context = await logto.getContext({ getAccessToken: false })(
    request
  );

  if (!context.isAuthenticated) {
    return redirect("/api/logto/sign-in");
  }

  return json<LoaderResponse>({ context });
};

const Home = () => {
  const data = useLoaderData<LoaderResponse>();

  return <div>Protected Route.</div>;
};
```

## Resources

[![Website](https://img.shields.io/badge/website-logto.io-8262F8.svg)](https://logto.io/)
[![Discord](https://img.shields.io/discord/965845662535147551?logo=discord&logoColor=ffffff&color=7389D8&cacheSeconds=600)](https://discord.gg/UEPaF3j5e6)
