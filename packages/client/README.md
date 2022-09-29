# Logto Client SDK
[![Version](https://img.shields.io/npm/v/@logto/client)](https://www.npmjs.com/package/@logto/client)
[![Build Status](https://github.com/logto-io/js/actions/workflows/main.yml/badge.svg)](https://github.com/logto-io/js/actions/workflows/main.yml)
[![Codecov](https://img.shields.io/codecov/c/github/logto-io/js)](https://app.codecov.io/gh/logto-io/js?branch=master)

The Logto JavaScript Client SDK written in TypeScript. Check out our [docs](https://docs.logto.io/sdk/JavaScript/client/) for more information.

We also provide [文档](https://docs.logto.io/zh-cn/sdk/JavaScript/sdk/client/) in Simplified Chinese.

## Installation

### Using npm

```bash
npm install @logto/client
```

### Using yarn

```bash
yarn add @logto/client
```

### Using pnpm

```bash
pnpm add @logto/client
```

## What is this and how does it work?

Logto JavaScript Client SDK is platformless, and is the foundation of the other platform's SDKs (Browser, Next.js, React, Vue, etc.). Usually you are not expected to use it directly in your application, as we have released a set of official SDKs to help you integrate Logto with your favorite JavaScript frameworks. [Check this out](https://docs.logto.io/docs/recipes/integrate-logto/) and get started!

If Logto does not support your framework and you want to contribute by building a new SDK, we recommend checking out our [Browser SDK](https://github.com/logto-io/js/tree/master/packages/browser) and [Node.js SDK](https://github.com/logto-io/js/tree/master/packages/node) and start from there.

### Adapters

To implement a platform-specific SDK, you should implement the following adapters:

1. requester: send http requests.
2. storage: save tokens and other info.
3. navigate: handle redirect.
4. generateState: generate state.
5. generateCodeVerifier: generate code verifier.
6. generateCodeChallenge: generate code challenge.

See the [adapters.ts](./src/adapter.ts) for more information.

## Resources

[![Website](https://img.shields.io/badge/website-logto.io-8262F8.svg)](https://logto.io/)
[![Docs](https://img.shields.io/badge/docs-logto.io-green.svg)](https://docs.logto.io/sdk/JavaScript/client/)
[![Discord](https://img.shields.io/discord/965845662535147551?logo=discord&logoColor=ffffff&color=7389D8&cacheSeconds=600)](https://discord.gg/UEPaF3j5e6)
