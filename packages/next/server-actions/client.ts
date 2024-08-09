'use server';

import { CookieStorage, type GetContextParameters, type InteractionMode } from '@logto/node';
import NodeClient from '@logto/node/edge';

import BaseClient from '../src/client';
import type { LogtoNextConfig } from '../src/types.js';

export type { LogtoContext, InteractionMode } from '@logto/node';

export default class LogtoClient extends BaseClient {
  constructor(config: LogtoNextConfig) {
    super(config, {
      NodeClient,
    });
  }

  /**
   * Init sign-in and return the url to redirect to Logto.
   *
   * @param redirectUri the uri (callbackUri) to redirect to after sign in
   * @param interactionMode OIDC interaction mode
   * @returns the url to redirect
   */
  async handleSignIn(
    redirectUri: string,
    interactionMode?: InteractionMode
  ): Promise<{ url: string; newCookie?: string }> {
    const nodeClient = await this.createNodeClient();
    await nodeClient.signIn(redirectUri, interactionMode);

    if (!this.navigateUrl) {
      // Not expected to happen
      throw new Error('navigateUrl is not set');
    }

    return {
      url: this.navigateUrl,
    };
  }

  /**
   * Init sign-out and return the url to redirect to Logto.
   *
   * @param redirectUri the uri (postSignOutUri) to redirect to after sign out
   * @returns the url to redirect to
   */
  async handleSignOut(redirectUri = this.config.baseUrl): Promise<string> {
    const nodeClient = await this.createNodeClient();
    await nodeClient.signOut(redirectUri);
    await this.storage?.destroy();

    if (!this.navigateUrl) {
      // Not expected to happen
      throw new Error('navigateUrl is not set');
    }

    return this.navigateUrl;
  }

  /**
   * Handle sign-in callback from Logto.
   *
   * @param callbackUrl the uri (callbackUri) to redirect to after sign in, should match the one used in handleSignIn
   */
  async handleSignInCallback(callbackUrl: string) {
    const nodeClient = await this.createNodeClient();

    await nodeClient.handleSignInCallback(callbackUrl);
  }

  /**
   * Get Logto context from cookies.
   *
   * @param config additional configs of GetContextParameters
   * @returns LogtoContext
   */
  async getLogtoContext(config: GetContextParameters = {}) {
    const nodeClient = await this.createNodeClient({ ignoreCookieChange: true });
    const context = await nodeClient.getContext(config);

    return context;
  }

  async createNodeClient({ ignoreCookieChange }: { ignoreCookieChange?: boolean } = {}) {
    const { cookies } = await import('next/headers');
    this.storage = new CookieStorage({
      encryptionKey: this.config.cookieSecret,
      cookieKey: `logto:${this.config.appId}`,
      isSecure: this.config.cookieSecure,
      getCookie: (...args) => {
        return cookies().get(...args)?.value ?? '';
      },
      setCookie: (...args) => {
        // In server component (RSC), it is not allowed to modify cookies, see https://nextjs.org/docs/app/api-reference/functions/cookies#cookiessetname-value-options.
        if (!ignoreCookieChange) {
          cookies().set(...args);
        }
      },
    });

    await this.storage.init();

    return new this.adapters.NodeClient(this.config, {
      storage: this.storage,
      navigate: (url) => {
        this.navigateUrl = url;
      },
    });
  }
}
