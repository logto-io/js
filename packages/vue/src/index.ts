import type { LogtoConfig } from '@logto/browser';
import LogtoClient from '@logto/browser';
import { type Optional } from '@silverhand/essentials';
import type { App, Ref } from 'vue';
import { inject, readonly, watchEffect } from 'vue';

import { logtoInjectionKey, contextInjectionKey } from './consts.js';
import type { Context } from './context.js';
import { createContext, throwContextError } from './context.js';
import { createPluginMethods } from './plugin.js';

export type {
  AccessTokenClaims,
  LogtoConfig,
  IdTokenClaims,
  UserInfoResponse,
  LogtoErrorCode,
  LogtoClientErrorCode,
  InteractionMode,
} from '@logto/browser';

export {
  LogtoError,
  LogtoRequestError,
  LogtoClientError,
  OidcError,
  Prompt,
  ReservedScope,
  UserScope,
  organizationUrnPrefix,
  buildOrganizationUrn,
  getOrganizationIdFromUrn,
  PersistKey,
} from '@logto/browser';

type OptionalPromiseReturn<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => Promise<infer R>
    ? (...args: A) => Promise<Optional<R>>
    : T[K];
};

type LogtoVuePlugin = {
  install: (app: App, config: LogtoConfig) => void;
};

type Logto = {
  isAuthenticated: Readonly<Ref<boolean>>;
  isLoading: Readonly<Ref<boolean>>;
  error: Readonly<Ref<Error | undefined>>;
} & OptionalPromiseReturn<
  Pick<
    LogtoClient,
    | 'getRefreshToken'
    | 'getAccessToken'
    | 'getAccessTokenClaims'
    | 'getOrganizationToken'
    | 'getOrganizationTokenClaims'
    | 'getIdToken'
    | 'getIdTokenClaims'
    | 'signOut'
    | 'fetchUserInfo'
    | 'clearAccessToken'
    | 'clearAllTokens'
  >
> &
  Pick<LogtoClient, 'signIn'>;

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

  watchEffect(async () => {
    if (!logtoClient.value) {
      return;
    }

    const currentPageUrl = window.location.href;
    const isAuthenticated = await logtoClient.value.isAuthenticated();
    const isRedirected = await logtoClient.value.isSignInRedirected(currentPageUrl);

    console.log('isAuthenticated', isAuthenticated);
    console.log('isRedirected', isRedirected);

    if (!isAuthenticated && isRedirected) {
      void handleSignInCallback(currentPageUrl, callback);
    }
  });

  return {
    isLoading: readonly(isLoading),
    isAuthenticated: readonly(isAuthenticated),
    error: readonly(error),
  };
};
