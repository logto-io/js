# Logto Next.js SDK

[![Version](https://img.shields.io/npm/v/@logto/next)](https://www.npmjs.com/package/@logto/next)
[![Build Status](https://github.com/logto-io/js/actions/workflows/main.yml/badge.svg)](https://github.com/logto-io/js/actions/workflows/main.yml)
[![Codecov](https://img.shields.io/codecov/c/github/logto-io/js)](https://app.codecov.io/gh/logto-io/js?branch=master)

The Logto Next.js SDK written in TypeScript.

Check out our [docs](https://docs.logto.io/sdk/next) for more information.

If you are using App Router and Server Actions, check out the [docs](https://docs.logto.io/sdk/next-app-router) for more information.

## Installation

### Using npm

```bash
npm install @logto/next
```

### Using yarn

```bash
yarn add @logto/next
```

### Using pnpm

```bash
pnpm add @logto/next
```

## Products

| Name                  | Description                                   |
| --------------------- | --------------------------------------------- |
| @logto/next           | Traditional Next.js SDK using Page Router     |
| @logto/edge           | Next.js SDK running in edge environment       |
| @logto/server-actions | Next.js SDK for App Router and Server Actions |

## Request-specific sign-in options

The Pages Router combined auth handler accepts shared defaults and a resolver for individual
requests:

```ts
import { Prompt } from '@logto/next';

export default logtoClient.handleAuthRoutes({
  signInOptions: { prompt: Prompt.Login },
  resolveSignInOptions: (request) => {
    const prompt = request.query.prompt;

    return prompt === 'consent' ? { prompt: Prompt.Consent } : {};
  },
});
```

Resolver values override `signInOptions`. The SDK manages callback redirect fields and forces the
registration screen for the sign-up route. Validate or allowlist request input before copying it
into sign-in options.

## Resources

[![Website](https://img.shields.io/badge/website-logto.io-8262F8.svg)](https://logto.io/)
[![Docs](https://img.shields.io/badge/docs-logto.io-green.svg)](https://docs.logto.io/)
[![Discord](https://img.shields.io/discord/965845662535147551?logo=discord&logoColor=ffffff&color=7389D8&cacheSeconds=600)](https://discord.gg/UEPaF3j5e6)
