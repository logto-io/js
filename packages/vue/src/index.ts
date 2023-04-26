import type { IdTokenClaims, LogtoConfig, UserInfoResponse } from '@logto/browser';
import LogtoClient from '@logto/browser';
import type { App, Ref } from 'vue';
import { inject, readonly, watchEffect } from 'vue';

import { logtoInjectionKey, contextInjectionKey } from './consts.js';
import type { Context } from './context.js';
import { createContext, throwContextError } from './context.js';
import { createPluginMethods } from './plugin.js';

export type {
  LogtoConfig,
  IdTokenClaims,
  UserInfoResponse,
  LogtoErrorCode,
  LogtoClientErrorCode,
  InteractionMode,
} from '@logto/browser';

export {
  LogtoError,
  LogtoClientError,
  OidcError,
  Prompt,
  ReservedScope,
  UserScope,
} from '@logto/browser';

type LogtoVuePlugin = {
  install: (app: App, config: LogtoConfig) => void;
};

type Logto = {
  isAuthenticated: Readonly<Ref<boolean>>;
  isLoading: Readonly<Ref<boolean>>;
  error: Readonly<Ref<Error | undefined>>;
  fetchUserInfo: () => Promise<UserInfoResponse | undefined>;
  getAccessToken: (resource?: string) => Promise<string | undefined>;
  getIdTokenClaims: () => Promise<IdTokenClaims | undefined>;
  signIn: (redirectUri: string) => Promise<void>;
  signOut: (postLogoutRedirectUri?: string) => Promise<void>;
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
export const useHandleSignInCallback = (callback?: () => void) => {
  const context = inject<Context>(contextInjectionKey);

  if (!context) {
    return throwContextError();
  }

  const { isAuthenticated, isLoading, logtoClient, error } = context;
  const { handleSignInCallback } = createPluginMethods(context);

  watchEffect(() => {
    const currentPageUrl = window.location.href;

    if (
      !isAuthenticated.value &&
      logtoClient.value?.isSignInRedirected(currentPageUrl) &&
      !isLoading.value
    ) {
      void handleSignInCallback(currentPageUrl, callback);
    }
  });

  return {
    isLoading: readonly(isLoading),
    isAuthenticated: readonly(isAuthenticated),
    error: readonly(error),
  };
};
