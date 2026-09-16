# Logto Express SDK
[![Version](https://img.shields.io/npm/v/@logto/express)](https://www.npmjs.com/package/@logto/express)
[![Build Status](https://github.com/logto-io/js/actions/workflows/main.yml/badge.svg)](https://github.com/logto-io/js/actions/workflows/main.yml)
[![Codecov](https://img.shields.io/codecov/c/github/logto-io/js)](https://app.codecov.io/gh/logto-io/js?branch=master)

The Logto Express SDK written in TypeScript.

Check out our [docs](https://docs.logto.io/sdk/express) for more information.

## Installation

### Using npm

```bash
npm install @logto/express
```

### Using yarn

```bash
yarn add @logto/express
```

### Using pnpm

```bash
pnpm add @logto/express
```

## Request-specific sign-in options

Use `signInOptions` for defaults shared by every sign-in. Add `getSignInOptions` when an
individual request needs to override them:

```ts
import { handleAuthRoutes, Prompt } from '@logto/express';

app.use(
  handleAuthRoutes(
    {
      ...config,
      signInOptions: { prompt: Prompt.Login },
    },
    {
      getSignInOptions: (request, flow) => {
        const prompt = request.query.prompt;

        return flow === 'signIn' && prompt === 'consent' ? { prompt: Prompt.Consent } : {};
      },
    }
  )
);
```

Resolver values override `signInOptions`. The SDK manages callback redirect fields and forces the
registration screen for the sign-up route. Validate or allowlist request input before copying it
into sign-in options.

## Resources

[![Website](https://img.shields.io/badge/website-logto.io-8262F8.svg)](https://logto.io/)
[![Docs](https://img.shields.io/badge/docs-logto.io-green.svg)](https://docs.logto.io/)
[![Discord](https://img.shields.io/discord/965845662535147551?logo=discord&logoColor=ffffff&color=7389D8&cacheSeconds=600)](https://discord.gg/UEPaF3j5e6)
