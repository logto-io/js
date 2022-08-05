import { IncomingMessage } from 'http';

import NodeClient from '@logto/node';
import { Request, Response, NextFunction, Router } from 'express';

import { LogtoExpressError } from './errors';
import ExpressStorage from './storage';
import { LogtoExpressConfig, WithLogtoConfig } from './types';

export type { LogtoContext } from '@logto/node';

export type Middleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => Promise<void>;

export default class LogtoClient {
  constructor(private readonly config: LogtoExpressConfig) {}

  handleSignIn =
    (redirectUri = `${this.config.baseUrl}/logto/sign-in-callback`): Middleware =>
    async (request, response) => {
      const nodeClient = this.createNodeClient(request, response);
      await nodeClient.signIn(redirectUri);
    };

  handleSignInCallback =
    (redirectTo = this.config.baseUrl): Middleware =>
    async (request, response) => {
      const nodeClient = this.createNodeClient(request, response);

      if (request.url) {
        await nodeClient.handleSignInCallback(`${this.config.baseUrl}${request.originalUrl}`);
        response.redirect(redirectTo);
      }
    };

  handleSignOut =
    (redirectUri = this.config.baseUrl): Middleware =>
    async (request, response) => {
      const nodeClient = this.createNodeClient(request, response);
      await nodeClient.signOut(redirectUri);
    };

  handleAuthRoutes = (): Router => {
    // eslint-disable-next-line new-cap
    const router = Router();

    router.use('/logto/:action', (request, response, next) => {
      const { action } = request.params;

      if (action === 'sign-in') {
        return this.handleSignIn()(request, response, next);
      }

      if (action === 'sign-in-callback') {
        return this.handleSignInCallback()(request, response, next);
      }

      if (action === 'sign-out') {
        return this.handleSignOut()(request, response, next);
      }

      response.status(404).end();
    });

    return router;
  };

  withLogto =
    (config: WithLogtoConfig = {}): Middleware =>
    async (request: IncomingMessage, response: Response, next: NextFunction) => {
      const client = this.createNodeClient(request, response);
      const user = await client.getContext(config.getAccessToken);
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      Object.defineProperty(request, 'user', { enumerable: true, get: () => user });
      next();
    };

  private createNodeClient(request: IncomingMessage, response: Response) {
    this.checkSession(request);
    const storage = new ExpressStorage(request);

    return new NodeClient(
      {
        ...this.config,
        persistAccessToken: this.config.persistAccessToken ?? true,
      },
      {
        storage,
        navigate: (url) => {
          response.redirect(url);
        },
      }
    );
  }

  private checkSession(request: IncomingMessage) {
    // We assume that `session` is configured in the express app, but need to check it there.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!request.session) {
      throw new LogtoExpressError('session_not_configured');
    }
  }
}
