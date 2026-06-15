import { RequestCookies, ResponseCookies } from '@edge-runtime/cookies';
import {
  CookieStorage,
  type SignInOptions,
  type GetContextParameters,
  type InteractionMode,
} from '@logto/node';
import NodeClient from '@logto/node/edge';
import { type NextRequest } from 'next/server';

import BaseClient from '../src/client';
import type { LogtoNextConfig } from '../src/types.js';
import { NavigationStore } from '../src/utils.js';

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

  handleSignIn: (
    options?: SignInOptions | string,
    interactionMode?: InteractionMode
  ) => (request: Request) => Promise<Response> = (
    options?: SignInOptions | string,
    interactionMode?: InteractionMode
  ) => {
    // The array function can not have multiple signatures, have to warn the deprecated usage
    if (typeof options === 'string') {
      console.warn('Deprecated: Use the object parameter for handleSignIn instead.');
      return this.handleSignInImplementation({ redirectUri: options, interactionMode });
    }

    return this.handleSignInImplementation(
      options ?? {
        redirectUri: `${this.config.baseUrl}/api/logto/sign-in-callback`,
      }
    );
  };

  handleSignOut =
    (redirectUri = this.config.baseUrl) =>
    async (request: NextRequest) => {
      const { nodeClient, storage, headers, getNavigateUrl } = await this.createRequestScopedClient(
        request
      );
      await nodeClient.signOut(redirectUri);
      await storage.destroy();

      const response = new Response(null, {
        headers,
        status: 307,
      });

      const navigateUrl = getNavigateUrl();
      if (navigateUrl) {
        response.headers.append('Location', navigateUrl);
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

  /**
   * Create a Node client for the current edge request.
   *
   * The public return shape is intentionally kept as `{ nodeClient, headers }` (unchanged from
   * previous versions) so existing callers keep working. The extra per-request state (storage,
   * navigation URL) needed internally is produced by {@link createRequestScopedClient}.
   */
  async createNodeClientFromEdgeRequest(request: Request) {
    const { nodeClient, headers } = await this.createRequestScopedClient(request);
    return { nodeClient, headers };
  }

  /**
   * Create a request-scoped Node client together with its per-request state.
   *
   * Storage and the navigation URL are kept local to this call rather than on the (typically
   * singleton) client instance, so concurrent requests can never clobber each other's state.
   */
  private async createRequestScopedClient(request: Request) {
    const cookies = new RequestCookies(request.headers);
    const headers = new Headers();
    const responseCookies = new ResponseCookies(headers);

    const storage = new CookieStorage({
      encryptionKey: this.config.cookieSecret ?? '',
      sessionWrapper: this.config.sessionWrapper,
      cookieKey: `logto_${this.config.appId}`,
      isSecure: this.config.cookieSecure,
      getCookie: (name) => {
        return cookies.get(name)?.value ?? '';
      },
      setCookie: (name, value, options) => {
        responseCookies.set(name, value, options);
      },
    });

    await storage.init();

    const navigation = new NavigationStore();
    const nodeClient = new this.adapters.NodeClient(this.config, {
      storage,
      navigate: navigation.navigate,
    });

    return { nodeClient, storage, headers, getNavigateUrl: () => navigation.url };
  }

  private readonly handleSignInImplementation =
    (options: SignInOptions) =>
    async (request: Request): Promise<Response> => {
      const { nodeClient, headers, getNavigateUrl } = await this.createRequestScopedClient(request);
      await nodeClient.signIn(options);

      const response = new Response(null, {
        headers,
        status: 307,
      });

      const navigateUrl = getNavigateUrl();
      if (navigateUrl) {
        response.headers.append('Location', navigateUrl);
      }

      return response;
    };
}
