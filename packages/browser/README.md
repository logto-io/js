# Logto JS (Core) SDK
[![Version](https://img.shields.io/npm/v/@logto/js)](https://www.npmjs.com/package/@logto/js)
[![Build Status](https://github.com/logto-io/js/actions/workflows/main.yml/badge.svg)](https://github.com/logto-io/js/actions/workflows/main.yml)
[![Codecov](https://img.shields.io/codecov/c/github/logto-io/js)](https://app.codecov.io/gh/logto-io/js?branch=master)

The Logto JavaScript Core SDK written in TypeScript. Check out our [docs](https://docs.logto.io/JavaScript/browser/) for more information.

We also provide [文档](https://docs.logto.io/zh-cn/sdk/JavaScript/browser/) in Simplified Chinese.

## Installation

### Using npm

```bash
npm install @logto/browser
```

### Using yarn

```bash
yarn add @logto/browser
```

### Using pnpm

```bash
pnpm add @logto/browser
```

## What is this and how does it work?

As the name suggests, Logto browser SDK is the foundation of all Logto SDKs that run in a browser environment (Vanilla, React, Vue, etc.). `@logto/browser` extends `@logto/client` and provides a browser specific implementation of the client adapters:

* Implements `Storage` by using browser `localStorage` and `sessionStorage`.
* Implements `navigate` method by using `window.location.href`.

Usually you are not expected to use it directly in your application, but instead choosing a framework specific SDK that built on top of it. We have already released a set of official SDKs to accelerate your integration. [Check this out](https://docs.logto.io/docs/recipes/integrate-logto/) and get started!

If Logto does not support your front-end framework and you want to create your own SDK from scratch, we recommend checking out the SDK specification first. You can also refer to our [React SDK](https://github.com/logto-io/js/tree/master/packages/react) and [Vue SDK](https://github.com/logto-io/js/tree/master/packages/react) to learn more about the implementation details.

## Resources

[![Website](https://img.shields.io/badge/website-logto.io-8262F8.svg)](https://logto.io/)
[![Docs](https://img.shields.io/badge/docs-logto.io-green.svg)](https://docs.logto.io/sdk/JavaScript/browser/)
[![Discord](https://img.shields.io/discord/965845662535147551?logo=discord&logoColor=ffffff&color=7389D8&cacheSeconds=600)](https://discord.gg/UEPaF3j5e6)