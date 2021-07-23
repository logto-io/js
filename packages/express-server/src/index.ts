import {
  ensureBasicOptions,
  extractBearerToken,
  ConfigParameters,
  validateUser,
} from '@logto/core';
import { NextFunction, Router as createRouter, Response } from 'express';
import { LogtoRequest } from './types.d';
import { requireAuth } from './require-auth';

export { requireAuth };

export function logto(options?: ConfigParameters): createRouter {
  const { authRequired } = ensureBasicOptions(options);
  const router = createRouter();
  router.use(async (request: LogtoRequest, response: Response, next: NextFunction) => {
    const token = extractBearerToken(request?.headers?.authorization);
    const user = await validateUser(token);
    request.logto = {
      user,
      isAuthenticated: Boolean(user),
    };
    if (authRequired) {
      router.use(requireAuth);
    }

    next();
  });
  return router;
}
