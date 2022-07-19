import NodeClient from '@logto/node';
import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiHandler, NextApiRequest } from 'next';

import NextStorage from './storage';
import { LogtoNextConfig, LogtoUser } from './types';

export type { LogtoUser } from './types';

// Refresh token can be revoked, so it is authenticated only when we have a unexpired access token
const checkIsAuthenticatedByAccessToken = async (client: NodeClient): Promise<boolean> => {
  try {
    await client.getAccessToken();

    return true;
  } catch {
    return false;
  }
};

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

  withLogtoApiRoute = (handler: NextApiHandler): NextApiHandler =>
    this.withIronSession(async (request, response) => {
      const nodeClient = this.createNodeClient(request);
      const isAuthenticated = await checkIsAuthenticatedByAccessToken(nodeClient);
      await this.storage?.save();

      const user: LogtoUser = {
        isAuthenticated,
        claims: isAuthenticated ? nodeClient.getIdTokenClaims() : undefined,
      };

      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      Object.defineProperty(request, 'user', { enumerable: true, get: () => user });

      return handler(request, response);
    });

  private createNodeClient(request: NextApiRequest) {
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

  private withIronSession(handler: NextApiHandler) {
    return withIronSessionApiRoute(handler, {
      cookieName: `logto:${this.config.appId}`,
      password: this.config.cookieSecret,
      cookieOptions: {
        secure: this.config.cookieSecure,
        maxAge: 14 * 24 * 60 * 60,
      },
    });
  }
}
