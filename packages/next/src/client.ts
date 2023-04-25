import type { IncomingMessage } from 'http';

import type { GetContextParameters, InteractionMode } from '@logto/node';
import NodeClient from '@logto/node';
import type { GetServerSidePropsContext, GetServerSidePropsResult, NextApiHandler } from 'next';

import NextStorage from './storage';
import type { Adapters, LogtoNextConfig } from './types';

export default class LogtoNextBaseClient {
  private navigateUrl?: string;
  private storage?: NextStorage;
  constructor(private readonly config: LogtoNextConfig, private readonly adapters: Adapters) {}

  handleSignIn = (
    redirectUri = `${this.config.baseUrl}/api/logto/sign-in-callback`,
    interactionMode?: InteractionMode
  ): NextApiHandler =>
    this.adapters.withIronSessionApiRoute(async (request, response) => {
      const nodeClient = this.createNodeClient(request);
      await nodeClient.signIn(redirectUri, interactionMode);
      await this.storage?.save();

      if (this.navigateUrl) {
        response.redirect(this.navigateUrl);
      }
    }, this.ironSessionConfigs);

  handleSignInCallback = (redirectTo = this.config.baseUrl): NextApiHandler =>
    this.adapters.withIronSessionApiRoute(async (request, response) => {
      const nodeClient = this.createNodeClient(request);

      if (request.url) {
        await nodeClient.handleSignInCallback(`${this.config.baseUrl}${request.url}`);
        await this.storage?.save();
        response.redirect(redirectTo);
      }
    }, this.ironSessionConfigs);

  handleSignOut = (redirectUri = this.config.baseUrl): NextApiHandler =>
    this.adapters.withIronSessionApiRoute(async (request, response) => {
      const nodeClient = this.createNodeClient(request);
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
    this.adapters.withIronSessionApiRoute(async (request, response) => {
      const user = await this.getLogtoUserFromRequest(request, config);

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
    this.adapters.withIronSessionSsr(async (context) => {
      const user = await this.getLogtoUserFromRequest(context.req, configs);
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      Object.defineProperty(context.req, 'user', { enumerable: true, get: () => user });

      return handler(context);
    }, this.ironSessionConfigs);

  private createNodeClient(request: IncomingMessage) {
    this.storage = new NextStorage(request);

    return new NodeClient(this.config, {
      storage: this.storage,
      navigate: (url) => {
        this.navigateUrl = url;
      },
    });
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

  private async getLogtoUserFromRequest(request: IncomingMessage, configs: GetContextParameters) {
    const nodeClient = this.createNodeClient(request);

    return nodeClient.getContext(configs);
  }
}
