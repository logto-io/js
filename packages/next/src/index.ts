import NodeClient, { type GetContextParameters, type InteractionMode } from '@logto/node';
import { withIronSessionApiRoute, withIronSessionSsr } from 'iron-session/next';
import {
  type GetServerSidePropsResult,
  type GetServerSidePropsContext,
  type NextApiHandler,
} from 'next';

import LogtoNextBaseClient from './client.js';
import type { LogtoNextConfig } from './types.js';

export { ReservedScope, UserScope } from '@logto/node';

export type { LogtoContext, InteractionMode } from '@logto/node';

export default class LogtoClient extends LogtoNextBaseClient {
  constructor(config: LogtoNextConfig) {
    super(config, {
      NodeClient,
    });
  }

  handleSignIn = (
    redirectUri = `${this.config.baseUrl}/api/logto/sign-in-callback`,
    interactionMode?: InteractionMode
  ): NextApiHandler =>
    withIronSessionApiRoute(async (request, response) => {
      const nodeClient = this.createNodeClient(request.session);
      await nodeClient.signIn(redirectUri, interactionMode);
      await this.storage?.save();

      if (this.navigateUrl) {
        response.redirect(this.navigateUrl);
      }
    }, this.ironSessionConfigs);

  handleSignInCallback = (redirectTo = this.config.baseUrl): NextApiHandler =>
    withIronSessionApiRoute(async (request, response) => {
      const nodeClient = this.createNodeClient(request.session);

      if (request.url) {
        await nodeClient.handleSignInCallback(`${this.config.baseUrl}${request.url}`);
        await this.storage?.save();
        response.redirect(redirectTo);
      }
    }, this.ironSessionConfigs);

  handleSignOut = (redirectUri = this.config.baseUrl): NextApiHandler =>
    withIronSessionApiRoute(async (request, response) => {
      const nodeClient = this.createNodeClient(request.session);
      await nodeClient.signOut(redirectUri);

      request.session.destroy();
      await this.storage?.save();

      if (this.navigateUrl) {
        response.redirect(this.navigateUrl);
      }
    }, this.ironSessionConfigs);

  handleUser = (configs?: GetContextParameters) =>
    this.withLogtoApiRoute((request, response) => {
      response.json(request.user);
    }, configs);

  handleAuthRoutes =
    (configs?: GetContextParameters): NextApiHandler =>
    (request, response) => {
      const { action } = request.query;

      if (action === 'sign-in') {
        return this.handleSignIn()(request, response);
      }

      if (action === 'sign-up') {
        return this.handleSignIn(undefined, 'signUp')(request, response);
      }

      if (action === 'sign-in-callback') {
        return this.handleSignInCallback()(request, response);
      }

      if (action === 'sign-out') {
        return this.handleSignOut()(request, response);
      }

      if (action === 'user') {
        return this.handleUser(configs)(request, response);
      }

      response.status(404).end();
    };

  withLogtoApiRoute = (
    handler: NextApiHandler,
    config: GetContextParameters = {}
  ): NextApiHandler =>
    withIronSessionApiRoute(async (request, response) => {
      const user = await this.getLogtoUserFromRequest(request.session, config);

      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      Object.defineProperty(request, 'user', { enumerable: true, get: () => user });

      return handler(request, response);
    }, this.ironSessionConfigs);

  withLogtoSsr = <P extends Record<string, unknown> = Record<string, unknown>>(
    handler: (
      context: GetServerSidePropsContext
    ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>,
    configs: GetContextParameters = {}
  ) =>
    withIronSessionSsr(async (context) => {
      const user = await this.getLogtoUserFromRequest(context.req.session, configs);
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      Object.defineProperty(context.req, 'user', { enumerable: true, get: () => user });

      return handler(context);
    }, this.ironSessionConfigs);
}
