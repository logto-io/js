import { IncomingMessage } from 'http';

import NodeClient from '@logto/node';
import { withIronSessionApiRoute, withIronSessionSsr } from 'iron-session/next';
import { GetServerSidePropsContext, GetServerSidePropsResult, NextApiHandler } from 'next';

import NextStorage from './storage';
import { LogtoNextConfig, WithLogtoConfig } from './types';

export { ReservedScope, UserScope } from '@logto/node';

export type { LogtoContext } from '@logto/node';

export default class LogtoClient {
  private navigateUrl?: string;
  private storage?: NextStorage;
  constructor(private readonly config: LogtoNextConfig) {}

  handleSignIn = (
    redirectUri = `${this.config.baseUrl}/api/logto/sign-in-callback`
  ): NextApiHandler =>
    withIronSessionApiRoute(async (request, response) => {
      const nodeClient = this.createNodeClient(request);
      await nodeClient.signIn(redirectUri);
      await this.storage?.save();

      if (this.navigateUrl) {
        response.redirect(this.navigateUrl);
      }
    }, this.ironSessionConfigs);

  handleSignInCallback = (redirectTo = this.config.baseUrl): NextApiHandler =>
    withIronSessionApiRoute(async (request, response) => {
      const nodeClient = this.createNodeClient(request);

      if (request.url) {
        await nodeClient.handleSignInCallback(`${this.config.baseUrl}${request.url}`);
        await this.storage?.save();
        response.redirect(redirectTo);
      }
    }, this.ironSessionConfigs);

  handleSignOut = (redirectUri = this.config.baseUrl): NextApiHandler =>
    withIronSessionApiRoute(async (request, response) => {
      const nodeClient = this.createNodeClient(request);
      await nodeClient.signOut(redirectUri);

      request.session.destroy();
      await this.storage?.save();

      if (this.navigateUrl) {
        response.redirect(this.navigateUrl);
      }
    }, this.ironSessionConfigs);

  handleUser = (config?: WithLogtoConfig) =>
    this.withLogtoApiRoute((request, response) => {
      response.json(request.user);
    }, config);

  handleAuthRoutes =
    (configs?: WithLogtoConfig): NextApiHandler =>
    (request, response) => {
      const { action } = request.query;

      if (action === 'sign-in') {
        return this.handleSignIn()(request, response);
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

  withLogtoApiRoute = (handler: NextApiHandler, config: WithLogtoConfig = {}): NextApiHandler =>
    withIronSessionApiRoute(async (request, response) => {
      const user = await this.getLogtoUserFromRequest(request, config.getAccessToken);

      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      Object.defineProperty(request, 'user', { enumerable: true, get: () => user });

      return handler(request, response);
    }, this.ironSessionConfigs);

  withLogtoSsr = <P extends Record<string, unknown> = Record<string, unknown>>(
    handler: (
      context: GetServerSidePropsContext
    ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>,
    config: WithLogtoConfig = {}
  ) =>
    withIronSessionSsr(async (context) => {
      const user = await this.getLogtoUserFromRequest(context.req, config.getAccessToken);
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      Object.defineProperty(context.req, 'user', { enumerable: true, get: () => user });

      return handler(context);
    }, this.ironSessionConfigs);

  private createNodeClient(request: IncomingMessage) {
    this.storage = new NextStorage(request);

    return new NodeClient(
      {
        ...this.config,
        persistAccessToken: this.config.persistAccessToken ?? true,
      },
      {
        storage: this.storage,
        navigate: (url) => {
          this.navigateUrl = url;
        },
      }
    );
  }

  private get ironSessionConfigs() {
    return {
      cookieName: `logto:${this.config.appId}`,
      password: this.config.cookieSecret,
      cookieOptions: {
        secure: this.config.cookieSecure,
        maxAge: 14 * 24 * 60 * 60,
      },
    };
  }

  private async getLogtoUserFromRequest(request: IncomingMessage, getAccessToken?: boolean) {
    const nodeClient = this.createNodeClient(request);

    return nodeClient.getContext(getAccessToken);
  }
}
