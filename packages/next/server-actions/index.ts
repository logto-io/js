'use server';

import { type GetContextParameters, type InteractionMode } from '@logto/node';
import NodeClient from '@logto/node/edge';

import BaseClient from '../src/client';
import { createSession } from '../src/session';
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
   * @param cookie the raw cookie string
   * @param redirectUri the uri (callbackUri) to redirect to after sign in
   * @param interactionMode OIDC interaction mode
   * @returns the url to redirect to and new cookie if any
   */
  async handleSignIn(
    cookie: string,
    redirectUri: string,
    interactionMode?: InteractionMode
  ): Promise<{ url: string; newCookie?: string }> {
    const { nodeClient, session } = await this.createNodeClientFromHeaders(cookie);
    await nodeClient.signIn(redirectUri, interactionMode);

    if (!this.navigateUrl) {
      // Not expected to happen
      throw new Error('navigateUrl is not set');
    }

    return {
      url: this.navigateUrl,
      newCookie: await session.getValues?.(),
    };
  }

  /**
   * Init sign-out and return the url to redirect to Logto.
   *
   * @param cookie the raw cookie string
   * @param redirectUri the uri (postSignOutUri) to redirect to after sign out
   * @returns the url to redirect to
   */
  async handleSignOut(cookie: string, redirectUri = this.config.baseUrl): Promise<string> {
    const { nodeClient } = await this.createNodeClientFromHeaders(cookie);
    await nodeClient.signOut(redirectUri);

    if (!this.navigateUrl) {
      // Not expected to happen
      throw new Error('navigateUrl is not set');
    }

    return this.navigateUrl;
  }

  /**
   * Handle sign-in callback from Logto.
   *
   * @param cookie the raw cookie string
   * @param callbackUrl the uri (callbackUri) to redirect to after sign in, should match the one used in handleSignIn
   * @returns new cookie if any
   */
  async handleSignInCallback(cookie: string, callbackUrl: string): Promise<string | undefined> {
    const { nodeClient, session } = await this.createNodeClientFromHeaders(cookie);

    await nodeClient.handleSignInCallback(callbackUrl);
    return session.getValues?.();
  }

  /**
   * Get Logto context from cookies.
   *
   * @param cookie the raw cookie string
   * @param config additional configs of GetContextParameters
   * @returns LogtoContext
   */
  async getLogtoContext(cookie: string, config: GetContextParameters = {}) {
    const { nodeClient } = await this.createNodeClientFromHeaders(cookie);
    const context = await nodeClient.getContext(config);

    return context;
  }

  private async createNodeClientFromHeaders(cookie: string) {
    const session = await createSession(
      {
        secret: this.config.cookieSecret,
        crypto,
      },
      cookie
    );

    const nodeClient = super.createNodeClient(session);

    return { nodeClient, session };
  }
}
