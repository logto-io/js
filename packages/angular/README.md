# Logto Angular SDK

The Logto SDK for Angular applications. It is built on `@logto/browser` and exposes Angular-native dependency injection and Signals.

## Installation

```sh
pnpm add @logto/angular
```

## Configuration

Register Logto in the application config:

```ts
import { type ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideLogto, UserScope } from '@logto/angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideLogto({
      endpoint: 'https://your-tenant.logto.app',
      appId: 'your-app-id',
      scopes: [UserScope.Email, UserScope.Organizations],
      resources: ['https://api.example.com'],
    }),
    provideRouter(routes),
  ],
};
```

## Sign in and sign out

Inject `LogtoService` and read its Signals directly from the template:

```ts
import { Component, inject } from '@angular/core';
import { LogtoService } from '@logto/angular';

@Component({
  selector: 'app-root',
  template: `
    @if (logto.isLoading()) {
    <p>Loading…</p>
    } @else if (logto.isAuthenticated()) {
    <button type="button" (click)="signOut()">Sign out</button>
    } @else {
    <button type="button" (click)="signIn()">Sign in</button>
    }
  `,
})
export class AppComponent {
  readonly logto = inject(LogtoService);

  async signIn() {
    await this.logto.signIn({
      redirectUri: `${window.location.origin}/callback`,
      postRedirectUri: window.location.origin,
    });
  }

  async signOut() {
    await this.logto.signOut(window.location.origin);
  }
}
```

## Handle the callback

Register a dedicated callback route and complete the sign-in flow after browser rendering:

```ts
import { afterNextRender, Component, inject } from '@angular/core';
import { LogtoService } from '@logto/angular';

@Component({
  standalone: true,
  template: '<p>Completing sign-in…</p>',
})
export class CallbackComponent {
  private readonly logto = inject(LogtoService);

  constructor() {
    afterNextRender(() => {
      void (async () => {
        const callbackUri = window.location.href;

        if (await this.logto.isSignInRedirected(callbackUri)) {
          await this.logto.handleSignInCallback(callbackUri);
        }
      })().catch(() => undefined);
    });
  }
}
```

`LogtoService` also exposes resource-aware access tokens, organization tokens, ID-token claims, userinfo, token clearing, and an `error` Signal. See the [Angular sample](../angular-sample/) for a complete integration.

## Server-side rendering

Authentication state is restored from browser storage after the first browser render. Tokens are not exposed during server rendering. Use a server or BFF SDK when authenticated data is required while rendering on the server.

## Migrating from v1

Version 2 replaces the `angular-auth-oidc-client` configuration helper with a first-party Logto SDK:

- Replace `provideAuth({ config: buildAngularAuthConfig(...) })` with `provideLogto(...)`.
- Replace `OidcSecurityService` with `LogtoService`.
- Pass redirect URIs to `signIn()` and `signOut()` instead of provider configuration.
- Add a callback route that calls `handleSignInCallback()`.
- Read `isLoading()`, `isAuthenticated()`, and `error()` Signals instead of subscribing to `checkAuth()`.

Version 1 accepted only one `resource` string. Applications that needed multiple resources sometimes used a comma-separated workaround:

```ts
buildAngularAuthConfig({
  // ...
  resource: 'com.company.resource1,com.company.resource2',
});
```

Version 2 supports the Logto resource array directly. Replace the workaround with separate array entries:

```ts
provideLogto({
  // ...
  resources: ['com.company.resource1', 'com.company.resource2'],
});
```

Existing third-party session data is not migrated; users need to sign in once after upgrading.
