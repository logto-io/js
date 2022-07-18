import NodeClient from '@logto/node';
import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiHandler, NextApiRequest } from 'next';

import NextStorage from './storage';
import { LogtoNextConfig } from './types';

export default class LogtoClient {
  private navigateUrl?: string;
  private storage?: NextStorage;
  constructor(private readonly config: LogtoNextConfig) {}

  handleSignIn = (redirectUri = `${this.config.baseUrl}/api/sign-in`): NextApiHandler =>
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
