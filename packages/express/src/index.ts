import { IncomingMessage } from 'http';

import NodeClient from '@logto/node';
import { Request, Response, NextFunction, Router } from 'express';

import { LogtoExpressError } from './errors';
import ExpressStorage from './storage';
import { LogtoExpressConfig } from './types';

export { ReservedScope, UserScope } from '@logto/node';

export type { LogtoContext } from '@logto/node';
export type { LogtoExpressConfig } from './types';

export type Middleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => Promise<void>;

const createNodeClient = (
  request: IncomingMessage,
  response: Response,
  config: LogtoExpressConfig
) => {
  // We assume that `session` is configured in the express app, but need to check it there.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!request.session) {
    throw new LogtoExpressError('session_not_configured');
  }

  const storage = new ExpressStorage(request);

  return new NodeClient(
    {
      ...config,
      persistAccessToken: config.persistAccessToken ?? true,
    },
    {
      storage,
      navigate: (url) => {
        response.redirect(url);
      },
    }
  );
};

export const handleAuthRoutes = (config: LogtoExpressConfig): Router => {
  // eslint-disable-next-line new-cap
  const router = Router();

  router.use('/logto/:action', async (request, response) => {
    const { action } = request.params;
    const nodeClient = createNodeClient(request, response, config);

    switch (action) {
      case 'sign-in': {
        await nodeClient.signIn(`${config.baseUrl}/logto/sign-in-callback`);

        break;
      }

      case 'sign-in-callback': {
        if (request.url) {
          await nodeClient.handleSignInCallback(`${config.baseUrl}${request.originalUrl}`);
          response.redirect(config.baseUrl);
        }

        break;
      }

      case 'sign-out': {
        await nodeClient.signOut(config.baseUrl);

        break;
      }

      default: {
        response.status(404).end();
      }
    }
  });

  return router;
};

export const withLogto =
  (config: LogtoExpressConfig): Middleware =>
  async (request: IncomingMessage, response: Response, next: NextFunction) => {
    const client = createNodeClient(request, response, config);
    const user = await client.getContext(config.getAccessToken);
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    Object.defineProperty(request, 'user', { enumerable: true, get: () => user });
    next();
  };
