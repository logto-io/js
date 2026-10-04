# Logto Angular sample

A sample Angular application demonstrating the first-party `@logto/angular` v2 SDK with browser rendering, hydration, and SSR.

The sample covers:

- Angular provider and Signal-based authentication state
- A dedicated `/callback` route
- Sign-in and sign-out redirects
- Userinfo and ID-token claims
- Multiple API resources and organization token claims
- SSR-safe post-render callback handling

## Configure Logto

Update the endpoint, app ID, API resources, and scopes in [`src/app/logto.config.ts`](src/app/logto.config.ts). The v2 SDK accepts multiple resources through the `resources` array.

Register these redirect URIs in the Logto Console:

- Sign-in redirect URI: `http://localhost:4200/callback`
- Post sign-out redirect URI: `http://localhost:4200`

If you want to request an organization token, enter an organization ID in the running sample. The `urn:logto:scope:organizations` scope is included by `UserScope.Organizations`.

## Install dependencies

This project is excluded from the workspace. Install its dependencies separately:

```sh
pnpm install --ignore-workspace
```

The sample depends on `@logto/angular` v2.

## Development server

```sh
pnpm start
```

Open `http://localhost:4200/`.

## Production and SSR build

```sh
pnpm build
```

Serve the generated SSR application with:

```sh
pnpm serve:ssr:@logto/angular-sample
```

## Unit tests

```sh
pnpm test --watch=false --browsers=ChromeHeadless
```
