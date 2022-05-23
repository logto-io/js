import LogtoClient, { IdTokenClaims, LogtoConfig, UserInfoResponse } from '@logto/browser';
import { App, inject, readonly, Ref, watchEffect } from 'vue';

import { logtoInjectionKey, contextInjectionKey } from './consts';
import { Context, createContext, throwContextError } from './context';
import { createPluginMethods } from './plugin';

export type { LogtoConfig, IdTokenClaims, UserInfoResponse } from '@logto/browser';

type LogtoVuePlugin = {
  install: (app: App, config: LogtoConfig) => void;
};

type Logto = {
  isAuthenticated: Readonly<Ref<boolean>>;
  isLoading: Readonly<Ref<boolean>>;
  error?: Readonly<Ref<Error | undefined>>;
  fetchUserInfo: () => Promise<UserInfoResponse | undefined>;
  getAccessToken: (resource?: string) => Promise<string | undefined>;
  getIdTokenClaims: () => IdTokenClaims | undefined;
  signIn: (redirectUri: string) => Promise<void>;
  signOut: (postLogoutRedirectUri: string) => Promise<void>;
};

/**
 * Creates the Logto Vue plugin
 *
 * ```ts
 * import { createApp } from 'vue';
 * import { createLogto } from '@logto/vue';
 *
 * const app = createApp(App);
 * const app.use(createLogto, {
 *   appId: '<your-app-id>',
 *   endpoint: '<your-oidc-endpoint-domain>',
 * });
 *
 * app.mount('#app');
 * ```
 *
 * Use this in your Vue root component to register the plugin
 */
export const createLogto: LogtoVuePlugin = {
  install(app: App, config: LogtoConfig) {
    const client = new LogtoClient(config);
    const context = createContext(client);
    const pluginMethods = createPluginMethods(context);
    const { isAuthenticated, isLoading, error } = context;

    app.provide<Context>(contextInjectionKey, context);
    app.provide<Logto>(logtoInjectionKey, {
      isAuthenticated: readonly(isAuthenticated),
      isLoading: readonly(isLoading),
      error: readonly(error),
      ...pluginMethods,
    });
  },
};

/**
 * A Vue composable method that provides the Logto reactive refs and auth methods.
 *
 * ```ts
 * import { useLogto } from '@logto/vue';
 *
 * export default {
 *  setup() {
 *    const { isAuthenticated, signIn } = useLogto();
 *
 *    return {
 *      isAuthenticated,
 *      onClickSignIn: () => {
 *        signIn('<your-redirect-uri>');
 *      },
 *    }
 *  }
 * }
 * ```
 *
 * Use this composable in the setup script of your Vue component to make sure the injection works
 */
export const useLogto = (): Logto => {
  const logto = inject<Logto>(logtoInjectionKey);

  if (!logto) {
    return throwContextError();
  }

  return logto;
};

/**
 * A Vue composable method that watches browser navigation and automatically handles the sign-in callback
 *
 * ```ts
 * import { useLogto } from '@logto/vue';
 * import { useHandleSignInCallback } from '@logto/vue';
 *
 * export default {
 *   setup() {
 *     useHandleSignInCallback();
 *   }
 * }
 * ```
 *
 * Use this in the setup script of your Callback page to make sure the injection works
 */
export const useHandleSignInCallback = (returnToPageUrl = window.location.origin) => {
  const context = inject<Context>(contextInjectionKey);

  if (!context) {
    return throwContextError();
  }

  const currentPageUrl = window.location.href;
  const { isAuthenticated, isLoading, logtoClient } = context;
  const { handleSignInCallback } = createPluginMethods(context);

  watchEffect(() => {
    if (!isAuthenticated.value && logtoClient.value?.isSignInRedirected(currentPageUrl)) {
      void handleSignInCallback(currentPageUrl, returnToPageUrl);
    }
  });

  return {
    isLoading: readonly(isLoading),
    isAuthenticated: readonly(isAuthenticated),
  };
};
