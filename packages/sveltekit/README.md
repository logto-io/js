# Logto SvelteKit SDK

[![Version](https://img.shields.io/npm/v/@logto/sveltekit)](https://www.npmjs.com/package/@logto/sveltekit)
[![Build Status](https://github.com/logto-io/js/actions/workflows/main.yml/badge.svg)](https://github.com/logto-io/js/actions/workflows/main.yml)

The Logto SvelteKit SDK written in TypeScript. Supports SvelteKit ^2.52.2 and ^3.0.0.

Check out our [docs](https://docs.logto.io/sdk/sveltekit/) for more information.

## Installation

### Using npm

```bash
npm install @logto/sveltekit
```

### Using yarn

```bash
yarn add @logto/sveltekit
```

### Using pnpm

```bash
pnpm add @logto/sveltekit
```

## Redirects after sign-in

`redirectUri` is the registered callback URL where the SDK handles the authentication response.
The optional `postRedirectUri` passed to `signIn()` is the destination after that callback succeeds.

SvelteKit 3 requires explicit permission for external redirects. The SDK always allows redirects
to Logto for sign-in and sign-out. To also allow an external `postRedirectUri`, set
`allowExternalPostRedirectUri` in the third argument of `handleLogto`:

```ts
export const handle = handleLogto(logtoConfig, cookieConfig, {
  allowExternalPostRedirectUri: true,
});
```

This option defaults to `false` and only takes effect in SvelteKit 3 and later. With the default,
SvelteKit allows internal destinations and rejects external `postRedirectUri` values. Set it to
`true` when migrating an application that uses an external destination to SvelteKit 3. SvelteKit 2
ignores the option and retains its existing redirect behavior.

The option permits external destinations; it does not supply a destination or validate whether
one is trusted. Validate user-provided `postRedirectUri` values before passing them to `signIn()`.
SvelteKit 3's own restrictions still apply, including its rejection of `javascript:` and `data:`
destinations. If `postRedirectUri` is omitted, the hook continues to redirect to `/` after the
callback. Clients supplied through `buildLogtoClient` are responsible for their own redirect policy.

## Get sample

A sample project can be found at [SvelteKit sample](https://github.com/logto-io/js/tree/master/packages/sveltekit-sample)

Check out the full JS repo and try it with pnpm.

```bash
pnpm i && pnpm build
cd packages/sveltekit-sample && pnpm start
```

## Resources

[![Website](https://img.shields.io/badge/website-logto.io-8262F8.svg)](https://logto.io/)
[![Docs](https://img.shields.io/badge/docs-logto.io-green.svg)](https://docs.logto.io/)
[![Discord](https://img.shields.io/discord/965845662535147551?logo=discord&logoColor=ffffff&color=7389D8&cacheSeconds=600)](https://discord.gg/UEPaF3j5e6)
