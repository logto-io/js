import { provideHttpClient, withFetch } from "@angular/common/http";
import { type ApplicationConfig } from "@angular/core";
import { provideClientHydration } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { provideLogto } from "@logto/angular";

import { routes } from "./app.routes";
import { logtoConfig } from "./logto.config";

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideLogto(logtoConfig),
    provideRouter(routes),
    provideClientHydration(),
  ],
};
