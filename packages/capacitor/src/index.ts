import { App } from '@capacitor/app';
import { Browser, type OpenOptions } from '@capacitor/browser';
import { Preferences } from '@capacitor/preferences';
import LogtoBaseClient, {
  LogtoClientError,
  type InteractionMode,
  type LogtoConfig,
  type SignInOptions,
} from '@logto/browser';

export {
  LogtoError,
  LogtoRequestError,
  LogtoClientError,
  OidcError,
  Prompt,
  ReservedScope,
  ReservedResource,
  UserScope,
  organizationUrnPrefix,
  buildOrganizationUrn,
  getOrganizationIdFromUrn,
  PersistKey,
} from '@logto/browser';

export type {
  AccessTokenClaims,
  IdTokenClaims,
  InteractionMode,
  LogtoErrorCode,
  UserInfoResponse,
} from '@logto/browser';

export type CapacitorConfig = {
  /**
   * The options to pass to the `open` method of the Capacitor Browser plugin.
   * @default { windowName: '_self', presentationStyle: 'popover' }
   */
  openOptions?: OpenOptions;
};

const toError = (value: unknown): Error =>
  value instanceof Error ? value : new Error(String(value));

const swallowError = (): void => {
  // Intentionally empty: listener-removal failures during cleanup must not override
  // the resolve/reject outcome the caller actually cares about.
};

export default class CapacitorLogtoClient extends LogtoBaseClient {
  constructor(config: LogtoConfig, capacitorConfig: CapacitorConfig = {}) {
    const { openOptions } = capacitorConfig;
    super(config);

    // Use the Capacitor Browser plugin to open the sign-in and sign-out pages
    // since the default location assignment method will open the pages in a
    // system browser. We need to open an in-app browser to be able to handle
    // the redirects back to the app.
    // https://capacitorjs.com/docs/apis/browser
    this.adapter.navigate = async (url) => {
      return Browser.open({
        url,
        windowName: '_self',
        presentationStyle: 'popover',
        ...openOptions,
      });
    };

    // Use the Capacitor Preferences plugin to store the tokens, which will
    // fallback to localStorage for web builds.
    // https://capacitorjs.com/docs/apis/preferences
    this.adapter.storage = {
      getItem: async (key) => {
        const { value } = await Preferences.get({ key });
        return value;
      },
      setItem: async (key, value) => {
        await Preferences.set({ key, value });
      },
      removeItem: async (key) => {
        await Preferences.remove({ key });
      },
    };
  }

  /**
   * **NOTE: Capacitor does not support this method signature, use the other overloads.**
   */
  async signIn(options: SignInOptions): Promise<void>;
  /**
   * Start the sign-in flow with the specified redirect URI. The URI must be
   * registered in the Logto Console.
   *
   * Remember to configure the correct [scheme or universal links](https://capacitorjs.com/docs/guides/deep-links)
   * to ensure the app can be opened from the redirect URI.
   *
   * @param redirectUri The redirect URI that the user will be redirected to after the sign-in flow is completed.
   * @param interactionMode The interaction mode to be used for the authorization request. Note it's not
   * a part of the OIDC standard, but a Logto-specific extension. Defaults to `signIn`.
   * @throws `LogtoClientError('user_cancelled')` when the user closes the browser before completing
   * sign-in. Errors raised by the underlying sign-in request or callback handler are rethrown if
   * they are `Error` instances; other thrown values are normalized to `Error` objects.
   *
   * @example
   * ```ts
   * const client = new CapacitorLogtoClient({
   *   endpoint: 'https://your.logto.endpoint',
   *   appId: 'your-app-id',
   * });
   *
   * await client.signIn('io.logto.example://callback'); // throws if error happens
   * console.log(await client.getIdTokenClaims()); // { sub: '123', ... }
   * ```
   *
   * @remarks
   * The user will be redirected to that URI after the sign-in flow is completed,
   * and the client will be able to get the authorization code from the URI.
   * {@link handleSignInCallback} will be called after the user is redirected.
   *
   * @see {@link https://docs.logto.io/docs/recipes/integrate-logto/vanilla-js/#sign-in | Sign in} for more information.
   * @see {@link InteractionMode}
   */
  async signIn(redirectUri: string, interactionMode?: InteractionMode): Promise<void>;
  async signIn(
    redirectUri: string | URL | SignInOptions,
    interactionMode?: InteractionMode
  ): Promise<void> {
    if (typeof redirectUri === 'object' && !(redirectUri instanceof URL)) {
      throw new TypeError('The first argument must be a string or a URL.');
    }

    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @silverhand/fp/no-let
      let redirectionHandled = false;
      // eslint-disable-next-line @silverhand/fp/no-let, prefer-const
      let appHandlePromise: Promise<{ remove: () => Promise<void> }> | undefined;
      // eslint-disable-next-line @silverhand/fp/no-let, prefer-const
      let browserHandlePromise: Promise<{ remove: () => Promise<void> }> | undefined;
      // eslint-disable-next-line @silverhand/fp/no-let
      let cleanupPromise: Promise<void> | undefined;

      // Memoize the cleanup so concurrent kickoffs share the same in-flight work
      // and every caller can `await` actual completion — not just an idempotency flag.
      const cleanup = async (): Promise<void> => {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        cleanupPromise ??= (async () => {
          await Promise.all([
            appHandlePromise?.then(async (handle) => handle.remove()).catch(swallowError),
            browserHandlePromise?.then(async (handle) => handle.remove()).catch(swallowError),
          ]);
        })();
        return cleanupPromise;
      };

      // eslint-disable-next-line @silverhand/fp/no-mutation
      appHandlePromise = App.addListener('appUrlOpen', async ({ url }) => {
        if (!url.startsWith(redirectUri.toString())) {
          return;
        }

        // eslint-disable-next-line @silverhand/fp/no-mutation
        redirectionHandled = true;

        try {
          // Kick off listener removal alongside the token exchange and browser dismiss
          // (matches the original parallelism); the awaited Promise.all guarantees all
          // three are done before resolve().
          await Promise.all([this.handleSignInCallback(url), Browser.close(), cleanup()]);
          resolve();
        } catch (error: unknown) {
          await cleanup();
          reject(toError(error));
        }
      });

      // eslint-disable-next-line @silverhand/fp/no-mutation
      browserHandlePromise = Browser.addListener('browserFinished', async () => {
        // On Android, the browserFinished event will be triggered on deep link redirection,
        // and may arrive before the appUrlOpen event. We need to wait for a short period
        // to ensure the appUrlOpen event is handled first.
        const BROWSER_FINISHED_GRACE_PERIOD_MS = 150;
        await new Promise((resolve) => {
          setTimeout(resolve, BROWSER_FINISHED_GRACE_PERIOD_MS);
        });

        if (redirectionHandled) {
          // `appUrlOpen` has already removed both listeners and settled the outer
          // promise — nothing for this handler to do.
          return;
        }

        await cleanup();
        reject(new LogtoClientError('user_cancelled'));
      });

      void (async () => {
        try {
          await Promise.all([appHandlePromise, browserHandlePromise]);
          await super.signIn(redirectUri, interactionMode);
        } catch (error: unknown) {
          await cleanup();
          reject(toError(error));
        }
      })();
    });
  }

  /**
   * Start the sign-out flow with the specified redirect URI. The URI must be
   * registered in the Logto Console.
   *
   * It will also revoke all the tokens and clean up the storage.
   *
   * - If the `postLogoutRedirectUri` is not specified, the user will see a default
   * page after the sign-out flow is completed, they need to close the browser
   * manually to return to the app.
   * - If the `postLogoutRedirectUri` is specified, the user will be redirected to
   * that URI after the sign-out flow is completed. Remember to configure the correct
   * [scheme or universal links](https://capacitorjs.com/docs/guides/deep-links)
   * to ensure the app can be opened from the redirect URI.
   *
   * @param postLogoutRedirectUri The URI that the user will be redirected to after the sign-out flow is completed.
   * @throws Propagates errors from OIDC discovery, token-storage operations, or the in-app
   * browser navigation. Refresh-token revocation failures are swallowed by the base client
   * and do not surface to the caller.
   *
   * @example
   * ```ts
   * await client.signOut('io.logto.example://callback');
   * ```
   */
  async signOut(postLogoutRedirectUri?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @silverhand/fp/no-let, prefer-const
      let listenerPromise: Promise<{ remove: () => Promise<void> }> | undefined;
      // eslint-disable-next-line @silverhand/fp/no-let
      let cleanupPromise: Promise<void> | undefined;

      const cleanup = async (): Promise<void> => {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        cleanupPromise ??= (async () => {
          await listenerPromise?.then(async (handle) => handle.remove()).catch(swallowError);
        })();
        return cleanupPromise;
      };

      // Match the original conditional shape: a single listener per flow. When a redirect
      // URI is configured we listen for the deep link; otherwise we listen for the user
      // closing the browser.
      // eslint-disable-next-line @silverhand/fp/no-mutation
      listenerPromise = postLogoutRedirectUri
        ? App.addListener('appUrlOpen', async ({ url }) => {
            if (!url.startsWith(postLogoutRedirectUri)) {
              return;
            }
            try {
              // Run listener removal in parallel with the browser dismiss (matches the
              // original) — Promise.all still waits for both before resolve().
              await Promise.all([Browser.close(), cleanup()]);
              resolve();
            } catch (error: unknown) {
              await cleanup();
              reject(toError(error));
            }
          })
        : Browser.addListener('browserFinished', async () => {
            await cleanup();
            resolve();
          });

      void (async () => {
        try {
          await listenerPromise;
          await super.signOut(postLogoutRedirectUri);
        } catch (error: unknown) {
          await cleanup();
          reject(toError(error));
        }
      })();
    });
  }
}
