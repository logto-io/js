import { defineNuxtModule, addServerHandler, addImportsDir, createResolver } from '@nuxt/kit';
import { defu } from 'defu';
import { type NuxtModule } from 'nuxt/schema';

import { defaults } from './runtime/utils/constants';
import { type LogtoRuntimeConfig, type LogtoRuntimeConfigInput } from './runtime/utils/types';

// This will not export the default export
export * from '@logto/node';
export { default as LogtoNodeClient } from '@logto/node';
export * from './runtime/utils/types';
export * from './runtime/utils/constants';

const logtoModule: NuxtModule<LogtoRuntimeConfigInput> = defineNuxtModule<LogtoRuntimeConfigInput>({
  meta: {
    name: '@logto/nuxt',
    configKey: 'logto',
  },
  defaults,
  setup(options, nuxt) {
    // Merge runtimeConfig with module options (options already merged with defaults)
    const runtimeConfig = defu<LogtoRuntimeConfig, LogtoRuntimeConfigInput[]>(
      nuxt.options.runtimeConfig.logto,
      options,
      {
        fetchUserInfo: false,
        postCallbackRedirectUri: '/',
        postLogoutRedirectUri: '/',
        pathnames: {
          signIn: '/sign-in',
          signOut: '/sign-out',
          callback: '/callback',
        },
      } satisfies LogtoRuntimeConfigInput
    );

    // eslint-disable-next-line @silverhand/fp/no-mutation
    nuxt.options.runtimeConfig.logto = runtimeConfig;

    const { resolve } = createResolver(import.meta.url);

    addServerHandler({
      handler: resolve('./runtime/server/event-handler'),
    });

    addImportsDir(resolve('./runtime/composables'));
  },
});

export default logtoModule;
