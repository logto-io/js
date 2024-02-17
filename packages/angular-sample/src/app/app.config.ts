import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAuth } from 'angular-auth-oidc-client';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { UserScope, buildAngularAuthConfig } from '@logto/js';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideAuth({
      config: buildAngularAuthConfig({
        endpoint: '<your-logto-endpoint>',
        appId: '<your-app-id>',
        scopes: [UserScope.Email], // Replace with your scopes
        redirectUri: '<your-app-redirect-uri>',
        postLogoutRedirectUri: '<your-app-post-logout-redirect-uri>',
        // See https://docs.logto.io/sdk/angular/ for more information
        // resource: 'https://default.logto.app/api'
      })
    }),
    provideRouter(routes),
    provideClientHydration()
  ]
};
