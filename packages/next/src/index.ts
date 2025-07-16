import { type IncomingMessage, type ServerResponse } from 'node:http';

import NodeClient, {
  CookieStorage,
  type SignInOptions,
  type GetContextParameters,
  type InteractionMode,
} from '@logto/node';
import { serialize } from 'cookie';
import {
  type GetServerSidePropsResult,
  type GetServerSidePropsContext,
  type NextApiHandler,
  type NextApiRequest,
  type NextApiResponse,
} from 'next';
import { type NextApiRequestCookies } from 'next/dist/server/api-utils/index.js';

import LogtoNextBaseClient from './client.js';
import type { ErrorHandler, LogtoNextConfig } from './types.js';
import { buildHandler } from './utils.js';

export type { LogtoNextConfig } from './types.js';

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
} from '@logto/node';

export type {
  AccessTokenClaims,
  IdTokenClaims,
  LogtoContext,
  InteractionMode,
  LogtoErrorCode,
  UserInfoResponse,
  SessionWrapper,
  SessionData,
} from '@logto/node';

export default class LogtoClient extends LogtoNextBaseClient {
  constructor(config: LogtoNextConfig) {
    super(config, {
      NodeClient,
    });

    if (!config.sessionWrapper && !config.cookieSecret) {
      throw new Error('cookieSecret is required when using default session wrapper');
    }
  }

  handleSignIn: (
    options?:
      | (SignInOptions & {
          onError?: ErrorHandler;
        })
      | string,
    interactionMode?: InteractionMode,
    onError?: ErrorHandler
  ) => NextApiHandler = (
    options?:
      | (SignInOptions & {
          onError?: ErrorHandler;
        })
      | string,
    interactionMode?: InteractionMode,
    onError?: ErrorHandler
  ) => {
    // The array function can not have multiple signatures, have to warn the deprecated usage
    if (typeof options === 'string') {
      console.warn('Deprecated: Use the object parameter for handleSignIn instead.');
      return this.handleSignInImplementation({ redirectUri: options, interactionMode, onError });
    }

    return this.handleSignInImplementation(
      options ?? {
        redirectUri: `${this.config.baseUrl}/api/logto/sign-in-callback`,
        interactionMode,
      }
    );
  };

  handleSignInCallback = (
    redirectTo = this.config.baseUrl,
    onError?: ErrorHandler
  ): NextApiHandler =>
    buildHandler(async (request, response) => {
      const nodeClient = await this.createNodeClientFromNextApi(request, response);

      if (request.url) {
        await nodeClient.handleSignInCallback(`${this.config.baseUrl}${request.url}`);

        // Check if there's a stored navigation URL (from postRedirectUri) first
        if (this.navigateUrl) {
          response.redirect(this.navigateUrl);
        } else {
          response.redirect(redirectTo);
        }
      }
    }, onError);

  handleSignOut = (redirectUri = this.config.baseUrl, onError?: ErrorHandler): NextApiHandler =>
    buildHandler(async (request, response) => {
      const nodeClient = await this.createNodeClientFromNextApi(request, response);
      await nodeClient.signOut(redirectUri);

      await this.storage?.destroy();

      if (this.navigateUrl) {
        response.redirect(this.navigateUrl);
      }
    }, onError);

  handleUser = (configs?: GetContextParameters, onError?: ErrorHandler) =>
    this.withLogtoApiRoute(
      (request, response) => {
        response.json(request.user);
      },
      configs,
      onError
    );

  handleAuthRoutes =
    (configs?: GetContextParameters, onError?: ErrorHandler): NextApiHandler =>
    (request, response) => {
      const { action } = request.query;

      if (action === 'sign-in') {
        return this.handleSignIn(undefined, undefined, onError)(request, response);
      }

      if (action === 'sign-up') {
        return this.handleSignIn(undefined, 'signUp', onError)(request, response);
      }

      if (action === 'sign-in-callback') {
        return this.handleSignInCallback(undefined, onError)(request, response);
      }

      if (action === 'sign-out') {
        return this.handleSignOut(undefined, onError)(request, response);
      }

      if (action === 'user') {
        return this.handleUser(configs)(request, response);
      }

      response.status(404).end();
    };

  getAccessToken = async (
    request: NextApiRequest,
    response: NextApiResponse,
    resource: string
  ): Promise<string> => {
    const nodeClient = await this.createNodeClientFromNextApi(request, response);
    return nodeClient.getAccessToken(resource);
  };

  getOrganizationToken = async (
    request: NextApiRequest,
    response: NextApiResponse,
    organizationId: string
  ): Promise<string> => {
    const nodeClient = await this.createNodeClientFromNextApi(request, response);
    return nodeClient.getOrganizationToken(organizationId);
  };

  withLogtoApiRoute = (
    handler: NextApiHandler,
    config: GetContextParameters = {},
    onError?: ErrorHandler
  ): NextApiHandler =>
    buildHandler(async (request, response) => {
      const nodeClient = await this.createNodeClientFromNextApi(request, response);
      const user = await nodeClient.getContext(config);

      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      Object.defineProperty(request, 'user', { enumerable: true, get: () => user });

      return handler(request, response);
    }, onError);

  withLogtoSsr =
    <P extends Record<string, unknown> = Record<string, unknown>>(
      handler: (
        context: GetServerSidePropsContext
      ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>,
      configs: GetContextParameters = {},
      onError?: (error: unknown) => unknown
    ) =>
    async (context: GetServerSidePropsContext) => {
      return this.withLogtoApiRoute(
        async () => {
          return handler(context);
        },
        configs,
        onError
      );
    };

  async createNodeClientFromNextApi(
    request: IncomingMessage & {
      cookies: NextApiRequestCookies;
    },
    response: ServerResponse
  ): Promise<NodeClient> {
    this.storage = new CookieStorage({
      // The type checking is done in the constructor, encryptionKey is required when using default session wrapper
      encryptionKey: this.config.cookieSecret ?? '',
      sessionWrapper: this.config.sessionWrapper,
      cookieKey: `logto_${this.config.appId}`,
      isSecure: this.config.cookieSecure,
      getCookie: (name) => {
        return request.cookies[name] ?? '';
      },
      setCookie: (name, value, options) => {
        response.setHeader('Set-Cookie', serialize(name, value, options));
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

  private readonly handleSignInImplementation = (
    options: SignInOptions & {
      onError?: ErrorHandler;
    }
  ): NextApiHandler =>
    buildHandler(async (request, response) => {
      const nodeClient = await this.createNodeClientFromNextApi(request, response);
      await nodeClient.signIn(options);

      if (this.navigateUrl) {
        response.redirect(this.navigateUrl);
      }
    }, options.onError);
}
