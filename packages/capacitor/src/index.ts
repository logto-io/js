import { App } from '@capacitor/app';
import { Browser, type OpenOptions } from '@capacitor/browser';
import { Preferences } from '@capacitor/preferences';
import LogtoBaseClient, { type InteractionMode, type LogtoConfig } from '@logto/browser';

export type CapacitorConfig = {
  /**
   * The options to pass to the `open` method of the Capacitor Browser plugin.
   * @default { windowName: '_self', presentationStyle: 'popover' }
   */
  openOptions?: OpenOptions;
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
   * Start the sign-in flow with the specified redirect URI. The URI must be
   * registered in the Logto Console.
   *
   * Remember to configure the correct [scheme or universal links](https://capacitorjs.com/docs/guides/deep-links)
   * to ensure the app can be opened from the redirect URI.
   *
   * @param redirectUri The redirect URI that the user will be redirected to after the sign-in flow is completed.
   * @param interactionMode The interaction mode to be used for the authorization request. Note it's not
   * a part of the OIDC standard, but a Logto-specific extension. Defaults to `signIn`.
   *
   * @returns `true` if the user completes the sign-in flow and is redirected back to the app; `false` if the user closes the browser during the sign-in.
   *
   * @example
   * ```ts
   * const client = new CapacitorLogtoClient({
   *   endpoint: 'https://your.logto.endpoint',
   *   appId: 'your-app-id',
   * });
   *
   * const success = await client.signIn('io.logto.example://callback'); // true or false
   * console.log(await client.getIdTokenClaims()); // { sub: '123', ... } or throws error
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
  async signIn(redirectUri: string, interactionMode?: InteractionMode): Promise<boolean> {
    return new Promise((resolve) => {
      const run = async () => {
        const [browserHandle, appHandle] = await Promise.all([
          // Handle the case where the user closes the browser during the sign-in.
          Browser.addListener('browserFinished', async () => {
            await Promise.all([browserHandle.remove(), appHandle.remove()]);
            resolve(false);
          }),
          // Handle the case where the user completes the sign-in and is redirected
          // back to the app.
          App.addListener('appUrlOpen', async ({ url }) => {
            if (!url.startsWith(redirectUri)) {
              return;
            }

            await Promise.all([
              // One last step of the sign-in flow
              this.handleSignInCallback(url),
              // Close the browser and remove the listeners
              Browser.close(),
              browserHandle.remove(),
              appHandle.remove(),
            ]);
            resolve(true);
          }),
          // Open the in-app browser to start the sign-in flow
          super.signIn(redirectUri, interactionMode),
        ]);
      };

      void run();
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
   * @returns `true` if the user completes the sign-out flow and is redirected back to the app.
   *
   * @example
   * ```ts
   * await client.signOut('io.logto.example://callback'); // true
   * ```
   */
  async signOut(postLogoutRedirectUri?: string): Promise<true> {
    return new Promise((resolve) => {
      const run = async () => {
        const [handle] = await Promise.all([
          postLogoutRedirectUri
            ? App.addListener('appUrlOpen', async ({ url }) => {
                if (postLogoutRedirectUri && !url.startsWith(postLogoutRedirectUri)) {
                  return;
                }
                await Promise.all([Browser.close(), handle.remove()]);
                resolve(true);
              })
            : Browser.addListener('browserFinished', async () => {
                await handle.remove();
                resolve(true);
              }),
          super.signOut(postLogoutRedirectUri),
        ]);
      };

      void run();
    });
  }
}
