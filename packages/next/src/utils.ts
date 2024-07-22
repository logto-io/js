import { type NextApiHandler } from 'next';

import { type ErrorHandler } from './types';

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
