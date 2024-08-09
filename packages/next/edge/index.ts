import { RequestCookies, ResponseCookies } from '@edge-runtime/cookies';
import { CookieStorage, type GetContextParameters, type InteractionMode } from '@logto/node';
import NodeClient from '@logto/node/edge';
import { type NextRequest } from 'next/server';

import BaseClient from '../src/client';
import type { LogtoNextConfig } from '../src/types.js';

export type {
  AccessTokenClaims,
  IdTokenClaims,
  LogtoContext,
  InteractionMode,
  LogtoErrorCode,
  UserInfoResponse,
} from '@logto/node';

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
    const cookies = new RequestCookies(request.headers);
    const headers = new Headers();
    const responseCookies = new ResponseCookies(headers);

    this.storage = new CookieStorage({
      encryptionKey: this.config.cookieSecret,
      cookieKey: `logto:${this.config.appId}`,
      isSecure: this.config.cookieSecure,
      getCookie: (name) => {
        return cookies.get(name)?.value ?? '';
      },
      setCookie: (name, value, options) => {
        responseCookies.set(name, value, options);
      },
    });

    await this.storage.init();

    const nodeClient = new this.adapters.NodeClient(this.config, {
      storage: this.storage,
      navigate: (url) => {
        this.navigateUrl = url;
      },
    });

    return { nodeClient, headers };
  }
}
