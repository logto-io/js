import {
  afterNextRender,
  inject,
  InjectionToken,
  makeEnvironmentProviders,
  provideAppInitializer,
  type EnvironmentProviders,
} from '@angular/core';
import LogtoClient, { type LogtoConfig } from '@logto/browser';

import { LogtoService } from './service.js';

/** Options for the Angular integration around the Logto Browser client. */
export type LogtoAngularOptions = {
  /**
   * Whether to cache OIDC discovery metadata in session storage.
   *
   * @default false
   */
  unstable_enableCache?: boolean;
};

const LOGTO_CONFIG = new InjectionToken<LogtoConfig>('logto.config');
const LOGTO_OPTIONS = new InjectionToken<LogtoAngularOptions>('logto.options');

/** The underlying Logto Browser client for advanced use cases and dependency overrides. */
export const LOGTO_CLIENT = new InjectionToken<LogtoClient>('logto.client');

/**
 * Provide a singleton Logto Browser client and Angular-native {@link LogtoService}.
 *
 * Authentication state is restored after the first browser render so server-rendered and hydrated
 * applications start from the same state.
 */
export const provideLogto = (
  config: LogtoConfig,
  options: LogtoAngularOptions = {}
): EnvironmentProviders =>
  makeEnvironmentProviders([
    { provide: LOGTO_CONFIG, useValue: config },
    { provide: LOGTO_OPTIONS, useValue: options },
    {
      provide: LOGTO_CLIENT,
      useFactory: () => {
        const logtoConfig = inject(LOGTO_CONFIG);
        const { unstable_enableCache = false } = inject(LOGTO_OPTIONS);

        return new LogtoClient(logtoConfig, unstable_enableCache);
      },
    },
    {
      provide: LogtoService,
      useFactory: () => new LogtoService(inject(LOGTO_CLIENT)),
    },
    provideAppInitializer(() => {
      const service = inject(LogtoService);

      afterNextRender(() => {
        void service.initialize();
      });
    }),
  ]);
