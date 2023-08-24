import { type GetContextParameters, type InteractionMode } from '@logto/node';
import NodeClient from '@logto/node/edge';
import { getIronSession } from 'iron-session/edge';
import { type NextRequest } from 'next/server';

import BaseClient from '../src/client';
import type { LogtoNextConfig } from '../src/types.js';

export type { LogtoContext, InteractionMode } from '@logto/node';

export default class LogtoClient extends BaseClient {
  constructor(config: LogtoNextConfig) {
    super(config, {
      NodeClient,
    });
  }

  handleSignIn =
    (
      redirectUri = `${this.config.baseUrl}/api/logto/sign-in-callback`,
      interactionMode?: InteractionMode
    ) =>
    async (request: NextRequest) => {
      const response = new Response(null, {
        status: 307,
      });
      const session = await getIronSession(request, response, this.ironSessionConfigs);

      const nodeClient = this.createNodeClient(session);
      await nodeClient.signIn(redirectUri, interactionMode);
      await this.storage?.save();

      if (this.navigateUrl) {
        response.headers.append('Location', this.navigateUrl);
      }

      return response;
    };

  handleSignOut =
    (redirectUri = this.config.baseUrl) =>
    async (request: NextRequest) => {
      const response = new Response(null, {
        status: 307,
      });
      const session = await getIronSession(request, response, this.ironSessionConfigs);

      const nodeClient = this.createNodeClient(session);
      await nodeClient.signOut(redirectUri);
      session.destroy();
      await this.storage?.save();

      if (this.navigateUrl) {
        response.headers.append('Location', this.navigateUrl);
      }

      return response;
    };

  handleSignInCallback =
    (redirectTo = this.config.baseUrl) =>
    async (request: NextRequest) => {
      const response = new Response(null, {
        status: 307,
        headers: {
          Location: redirectTo,
        },
      });
      const session = await getIronSession(request, response, this.ironSessionConfigs);

      const nodeClient = this.createNodeClient(session);

      if (request.url) {
        // When app is running behind reverse proxy which is common for edge runtime,
        // the `request.url`'s domain may not be expected, replace to the configured baseUrl
        const requestUrl = new URL(request.url);
        const callbackUrl = new URL(
          `${requestUrl.pathname}${requestUrl.search}${requestUrl.hash}`,
          this.config.baseUrl
        );
        await nodeClient.handleSignInCallback(callbackUrl.toString());
        await this.storage?.save();
      }

      return response;
    };

  handleUser = (configs?: GetContextParameters) => async (request: NextRequest) => {
    const context = await this.getLogtoContext(request, configs);
    return new Response(JSON.stringify(context), {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    });
  };

  getLogtoContext = async (request: NextRequest, config: GetContextParameters = {}) => {
    const session = await getIronSession(request, new Response(), this.ironSessionConfigs);
    const context = await this.getLogtoUserFromRequest(session, config);

    return context;
  };
}
