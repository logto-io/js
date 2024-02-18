import { RequestCookies, ResponseCookies } from '@edge-runtime/cookies';
import { createSession, type GetContextParameters, type InteractionMode } from '@logto/node';
import NodeClient from '@logto/node/edge';
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
    async (request: Request) => {
      const { nodeClient, headers } = await this.createNodeClientFromEdgeRequest(request);
      await nodeClient.signIn(redirectUri, interactionMode);
      await this.storage?.save();

      const response = new Response(null, {
        headers,
        status: 307,
      });

      if (this.navigateUrl) {
        response.headers.append('Location', this.navigateUrl);
      }

      return response;
    };

  handleSignOut =
    (redirectUri = this.config.baseUrl) =>
    async (request: NextRequest) => {
      const { nodeClient, headers } = await this.createNodeClientFromEdgeRequest(request);
      await nodeClient.signOut(redirectUri);
      await this.storage?.destroy();
      await this.storage?.save();

      const response = new Response(null, {
        headers,
        status: 307,
      });

      if (this.navigateUrl) {
        response.headers.append('Location', this.navigateUrl);
      }

      return response;
    };

  handleSignInCallback =
    (redirectTo = this.config.baseUrl) =>
    async (request: NextRequest) => {
      const { nodeClient, headers } = await this.createNodeClientFromEdgeRequest(request);

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

      const response = new Response(null, {
        status: 307,
        headers,
      });
      response.headers.append('Location', redirectTo);
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
    const { nodeClient } = await this.createNodeClientFromEdgeRequest(request);
    const context = await nodeClient.getContext(config);

    return context;
  };

  async createNodeClientFromEdgeRequest(request: Request) {
    const cookieName = `logto:${this.config.appId}`;
    const cookies = new RequestCookies(request.headers);
    const headers = new Headers();
    const responseCookies = new ResponseCookies(headers);

    const nodeClient = super.createNodeClient(
      await createSession(
        {
          secret: this.config.cookieSecret,
          crypto,
        },
        cookies.get(cookieName)?.value ?? '',
        (value) => {
          responseCookies.set(cookieName, value, {
            maxAge: 14 * 3600 * 24,
            secure: this.config.cookieSecure,
          });
        }
      )
    );

    return { nodeClient, headers };
  }
}
