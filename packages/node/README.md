# Logto Node.js SDK

[![Version](https://img.shields.io/npm/v/@logto/node)](https://www.npmjs.com/package/@logto/node)
[![Build Status](https://github.com/logto-io/js/actions/workflows/main.yml/badge.svg)](https://github.com/logto-io/js/actions/workflows/main.yml)
[![Codecov](https://img.shields.io/codecov/c/github/logto-io/js)](https://app.codecov.io/gh/logto-io/js?branch=master)

The Logto Node.js SDK written in TypeScript.

## Table of Contents
- [Installation](#installation)
- [What is this and how does it work?](#what-is-this-and-how-does-it-work)
- [How to create your own SDK from scratch?](#how-to-create-your-own-sdk-from-scratch)
- [Resources](#resources)

## Installation

### Using npm

```bash
npm install @logto/node
```

### Using yarn

```bash
yarn add @logto/node
```

### Using pnpm

```bash
pnpm add @logto/node
```

## What is this and how does it work?

As the name suggests, Logto Node.js SDK is the foundation of all Logto SDKs that run in Node.js (Express, Next.js, etc.). `@logto/node` extends `@logto/client` and provides a Node.js specific implementation of the client adapters:

- Implements `requester` by using package `node-fetch`.
- Implements `generateCodeChallenge`, `generateCodeVerifier`, `generateState` methods by using `crypto`.

Usually, you are not expected to use it directly in your application, but instead choosing a framework specific SDK that built on top of it. We have already released a set of official SDKs to accelerate your integration. [Check this out](https://docs.logto.io/integrate-logto) and get started!

## How to create your own SDK from scratch?

If Logto does not support your traditional web framework and you want to create your own SDK from scratch, we recommend checking out the SDK specification first. You can also refer to our [Express SDK](https://github.com/logto-io/js/tree/master/packages/express) and [Next.js SDK](https://github.com/logto-io/js/tree/master/packages/next) to learn more about the implementation details.

### Prerequisites
- Basic understanding of Node.js and TypeScript
- Familiarity with your target web framework
- Understanding of OAuth 2.0 and OpenID Connect concepts

### Step 1: Setup the project

Prepare your project by installing `@logto/node` as the dependency.

### Step 2: Implement store adapter

The store adapter is used to store the Logto session information. In most cases, we recommend using cookie-based storage to store the session information.

```typescript
// storage.ts
import { CookieStorage } from '@logto/node';

export const storage = new CookieStorage({
  encryptionKey: '<your-encryption-key>',
  cookieKey: `<logto_app_xxx>`,
  isSecure: false, // Set to true if you are using HTTPS
  getCookie: (name) => {
    // Example usage, get cookie from the request, depends on your framework
    return request.cookies[name] ?? '';
  },
  setCookie: (name, value, options) => {
    // Example usage, set cookie to the response, depends on your framework
    response.setHeader('Set-Cookie', serialize(name, value, options));
  },
});
```

This will wrap the session data, encrypt it with the encryption key, and store it in the cookie directly.

But the cookie size is limited, so you may need to use external storage like Redis or memory cache to store the session information. Especially when you are using organization features, the session information will be quite large.

```typescript
// storage.ts
import { CookieStorage } from '@logto/node';

class RedisSessionWrapper implements SessionWrapper {
  constructor(private readonly redis: Redis) {}

  async wrap(data: unknown, _key: string): Promise<string> {
    const sessionId = randomUUID();
    await this.redis.set(`logto_session_${sessionId}`, JSON.stringify(data));
    return sessionId;
  }

  async unwrap(value: string, _key: string): Promise<SessionData> {
    if (!value) {
      return {};
    }

    const data = await this.redis.get(`logto_session_${value}`);
    return JSON.parse(data);
  }
}

export const storage = new CookieStorage({
  cookieKey: `<logto_app_xxx>`,
  sessionWrapper: new RedisSessionWrapper(redis),
  isSecure: false, // Set to true if you are using HTTPS
  getCookie: (name) => {
    // Example usage, get cookie from the request, depends on your framework
    return request.cookies[name] ?? '';
  },
  setCookie: (name, value, options) => {
    // Example usage, set cookie to the response, depends on your framework
    response.setHeader('Set-Cookie', serialize(name, value, options));
  },
});
```

### Step 3: Implement navigation adapter and create the client

Continue to prepare the navigation adapter and create the client. You need to implement the "redirect" function to redirect the user to the Logto sign-in page.

```typescript
// client.ts
import { NodeClient } from '@logto/node';
import { config } from './config';
import { storage } from './storage';

export const client = new NodeClient({
  ...config,
  storage,
  navigate: (url) => {
    // Example usage, navigate to the url, depends on your framework
    response.redirect(url);
  },
});
```

### Step 4: Use the client to sign in

You can now trigger the sign-in flow by calling the `signIn` method.

```typescript
// app.ts
import { client } from './client';

await client.signIn({
  redirectUri: 'http://localhost:3000/callback',
});
```

### Step 5: Handle the sign-in callback

You need to handle the sign-in callback by calling the `signInCallback` method.

```typescript
// app.ts
import { client } from './client';

// You'll need to pass the full url to the callback handler,
// it depends on your framework to get the url.
await client.handleSignInCallback(`${request.url}`);

// After handling the callback, the user is signed in,
// information stored in the storage adapter we created earlier,
// you can now redirect the user to the home page.
response.redirect('/');
```

### Step 6: Implement sign out and other methods

You can now implement the sign out and other methods by referring to our example implementation in other frameworks.

### Step 7: Retrieve user information and protect resources

You can call the `getContext` method to retrieve the user information and protect your resources based on the context.

```typescript
// app.ts
import { client } from './client';

const { isAuthenticated, claims } = await client.getContext();

if (!isAuthenticated) {
  // The user is not signed in, redirect to the sign-in page.
  // protect the resource from being accessed by unauthenticated users.
  response.redirect('/sign-in');
}

// The user is signed in, you can now do something with the user information.
console.log(claims);
```

### Awesome unofficial SDKs

We have a list of awesome implementations of Logto SDK:

- [Astro SDK](https://github.com/RyzeKit/astro-logto-auth-example)

We are grateful for the amazing Logto community!

## Resources

[![Website](https://img.shields.io/badge/website-logto.io-8262F8.svg)](https://logto.io/)
[![Docs](https://img.shields.io/badge/docs-logto.io-green.svg)](https://docs.logto.io/sdk/JavaScript/node/)
[![Discord](https://img.shields.io/discord/965845662535147551?logo=discord&logoColor=ffffff&color=7389D8&cacheSeconds=600)](https://discord.gg/UEPaF3j5e6)
