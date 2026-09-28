import { defineNuxtModule, addServerHandler, addImportsDir, createResolver } from '@nuxt/kit';
// Load @nuxt/nitro-server's Nuxt hook type augmentations.
// eslint-disable-next-line import/no-unassigned-import
import type {} from '@nuxt/nitro-server';
import { defu } from 'defu';
import { type NuxtModule } from 'nuxt/schema';

import { defaults } from './runtime/utils/constants';
import {
  type LogtoPublicRuntimeConfig,
  type LogtoRuntimeConfig,
  type LogtoRuntimeConfigInput,
} from './runtime/utils/types';

// This will not export the default export
export * from '@logto/node';
export { default as LogtoNodeClient } from '@logto/node';
export * from './runtime/utils/types';
export * from './runtime/utils/constants';
export * from './runtime/utils/handler';

const logtoModule: NuxtModule<LogtoRuntimeConfigInput> = defineNuxtModule<LogtoRuntimeConfigInput>({
  meta: {
    name: '@logto/nuxt',
    configKey: 'logto',
  },
  defaults,
  setup(options, nuxt) {
    // Merge runtimeConfig with module options (options already merged with defaults)
    const runtimeConfig = defu<LogtoRuntimeConfig, LogtoRuntimeConfigInput[]>(
      // eslint-disable-next-line no-restricted-syntax
      nuxt.options.runtimeConfig.logto as LogtoRuntimeConfig,
      options,
      {
        fetchUserInfo: false,
        postCallbackRedirectUri: '/',
        postLogoutRedirectUri: '/',
        pathnames: {
          signIn: '/sign-in',
          signOut: '/sign-out',
          callback: '/callback',
          accessToken: '/api/logto/access-token',
        },
      } satisfies LogtoRuntimeConfigInput
    );

    // eslint-disable-next-line @silverhand/fp/no-mutation
    nuxt.options.runtimeConfig.logto = runtimeConfig;

    /**
     * `useLogtoAccessToken` runs in the browser, so the endpoint pathname has to be readable there.
     * It is derived from the same value the event handler matches on, which keeps the two in sync
     * even when the pathname is overridden at runtime.
     */
    // eslint-disable-next-line @silverhand/fp/no-mutation
    nuxt.options.runtimeConfig.public.logto = defu(
      // eslint-disable-next-line no-restricted-syntax -- The public config is augmented by this module
      nuxt.options.runtimeConfig.public.logto as LogtoPublicRuntimeConfig | undefined,
      { accessTokenPath: runtimeConfig.pathnames.accessToken }
    ) satisfies LogtoPublicRuntimeConfig;

    const { resolve } = createResolver(import.meta.url);

    addServerHandler({
      handler: resolve('./runtime/server/event-handler'),
    });

    addImportsDir(resolve('./runtime/composables'));

    nuxt.hook('nitro:config', (nitroConfig) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      nitroConfig.alias ||= {};
      // eslint-disable-next-line @silverhand/fp/no-mutation
      nitroConfig.alias['#logto'] = resolve('./runtime/utils/handler.js');
    });
  },
});

export default logtoModule;
