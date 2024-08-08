import { type IncomingMessage, type ServerResponse } from 'node:http';

import NodeClient, {
  createSession,
  type GetContextParameters,
  type InteractionMode,
} from '@logto/node';
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
} from '@logto/node';

export default class LogtoClient extends LogtoNextBaseClient {
  constructor(config: LogtoNextConfig) {
    super(config, {
      NodeClient,
    });
  }

  handleSignIn = (
    redirectUri = `${this.config.baseUrl}/api/logto/sign-in-callback`,
    interactionMode?: InteractionMode,
    onError?: ErrorHandler
  ): NextApiHandler =>
    buildHandler(async (request, response) => {
      const nodeClient = await this.createNodeClientFromNextApi(request, response);
      await nodeClient.signIn(redirectUri, interactionMode);
      await this.storage?.save();

      if (this.navigateUrl) {
        response.redirect(this.navigateUrl);
      }
    }, onError);

  handleSignInCallback = (
    redirectTo = this.config.baseUrl,
    onError?: ErrorHandler
  ): NextApiHandler =>
    buildHandler(async (request, response) => {
      const nodeClient = await this.createNodeClientFromNextApi(request, response);

      if (request.url) {
        await nodeClient.handleSignInCallback(`${this.config.baseUrl}${request.url}`);
        await this.storage?.save();
        response.redirect(redirectTo);
      }
    }, onError);

  handleSignOut = (redirectUri = this.config.baseUrl, onError?: ErrorHandler): NextApiHandler =>
    buildHandler(async (request, response) => {
      const nodeClient = await this.createNodeClientFromNextApi(request, response);
      await nodeClient.signOut(redirectUri);

      await this.storage?.destroy();
      await this.storage?.save();

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
      await this.storage?.save();

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
    const cookieName = `logto:${this.config.appId}`;

    return super.createNodeClient(
      await createSession(
        {
          secret: this.config.cookieSecret,
          crypto,
        },
        request.cookies[cookieName] ?? '',
        (value) => {
          const secure = this.config.cookieSecure;
          const maxAge = 14 * 3600 * 24;
          response.setHeader(
            'Set-Cookie',
            `${cookieName}=${value}; Path=/; Max-Age=${maxAge}; ${
              secure ? 'Secure; SameSite=Lax' : ''
            }`
          );
        }
      )
    );
  }
}
