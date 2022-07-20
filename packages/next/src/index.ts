import NodeClient from '@logto/node';
import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import NextStorage from './storage';
import { LogtoNextConfig, LogtoUser, NextApiRequestWithLogtoUser } from './types';

export type { LogtoUser } from './types';

export default class LogtoClient {
  private navigateUrl?: string;
  private storage?: NextStorage;
  constructor(private readonly config: LogtoNextConfig) {}

  handleSignIn = (redirectUri = `${this.config.baseUrl}/api/sign-in-callback`): NextApiHandler =>
    this.withIronSession(async (request, response) => {
      const nodeClient = this.createNodeClient(request);
      await nodeClient.signIn(redirectUri);
      await this.storage?.save();

      if (this.navigateUrl) {
        response.redirect(this.navigateUrl);
      }
    });

  handleSignInCallback = (redirectTo = this.config.baseUrl): NextApiHandler =>
    this.withIronSession(async (request, response) => {
      const nodeClient = this.createNodeClient(request);

      if (request.url) {
        await nodeClient.handleSignInCallback(`${this.config.baseUrl}${request.url}`);
        await this.storage?.save();
        response.redirect(redirectTo);
      }
    });

  handleSignOut = (redirectUri = this.config.baseUrl): NextApiHandler =>
    this.withIronSession(async (request, response) => {
      const nodeClient = this.createNodeClient(request);
      await nodeClient.signOut(redirectUri);

      request.session.destroy();
      await this.storage?.save();

      if (this.navigateUrl) {
        response.redirect(this.navigateUrl);
      }
    });

  handleUser = () =>
    this.withLogtoApiRoute((request, response) => {
      response.json(request.user);
    });

  withLogtoApiRoute = (
    handler: (
      request: NextApiRequestWithLogtoUser,
      response: NextApiResponse
    ) => unknown | Promise<unknown>
  ): NextApiHandler =>
    this.withIronSession(async (request, response) => {
      const nodeClient = this.createNodeClient(request);
      const { isAuthenticated } = nodeClient;

      const user: LogtoUser = {
        isAuthenticated,
        claims: isAuthenticated ? nodeClient.getIdTokenClaims() : undefined,
      };

      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      Object.defineProperty(request, 'user', { enumerable: true, get: () => user });

      return handler(request as NextApiRequestWithLogtoUser, response);
    });

  private createNodeClient(request: NextApiRequest) {
    this.storage = new NextStorage(request);

    return new NodeClient(this.config, {
      storage: this.storage,
      navigate: (url) => {
        this.navigateUrl = url;
      },
    });
  }

  private withIronSession(handler: NextApiHandler) {
    return withIronSessionApiRoute(handler, {
      cookieName: `logto:${this.config.appId}`,
      password: this.config.cookieSecret,
      cookieOptions: {
        secure: this.config.cookieSecure,
      },
    });
  }
}
