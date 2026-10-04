import { type NextApiHandler } from 'next';

import { type ErrorHandler } from './types';

/**
 * Holds the navigation URL captured from a Node client's `navigate` callback for a single
 * request. Keeping this state in a per-request instance (rather than on the shared, typically
 * singleton, `LogtoClient`) is what makes concurrent requests safe from clobbering each other.
 */
export class NavigationStore {
  url?: string;

  readonly navigate = (url: string): void => {
    this.url = url;
  };
}

export const buildHandler = (handler: NextApiHandler, onError?: ErrorHandler): NextApiHandler => {
  return async (request, response) => {
    try {
      await handler(request, response);
    } catch (error: unknown) {
      if (onError) {
        return onError(request, response, error);
      }

      throw error;
    }
  };
};
