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

## Request-specific sign-in options

Set module-level `signInOptions` for defaults shared by every sign-in. To override them for an
individual request, register the `logto:sign-in-options` Nitro hook in a server plugin:

```ts
// server/plugins/logto.ts
import { Prompt } from '@logto/nuxt';

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('logto:sign-in-options', ({ event, signInOptions }) => {
    const prompt = getQuery(event).prompt;

    if (prompt === 'login' || prompt === 'consent') {
      Object.assign(signInOptions, {
        prompt: prompt === 'login' ? Prompt.Login : Prompt.Consent,
      });
    }
  });
});
```

Hook values override module-level defaults. The SDK still owns the callback redirect URI. Validate
or allowlist request input before copying it into sign-in options.

## Resources

[![Website](https://img.shields.io/badge/website-logto.io-8262F8.svg)](https://logto.io/)
[![Docs](https://img.shields.io/badge/docs-logto.io-green.svg)](https://docs.logto.io/)
[![Discord](https://img.shields.io/discord/965845662535147551?logo=discord&logoColor=ffffff&color=7389D8&cacheSeconds=600)](https://discord.gg/UEPaF3j5e6)
