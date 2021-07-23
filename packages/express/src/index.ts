import {
  ensureBasicOptions,
  extractBearerToken,
  ConfigParameters,
  validateUser,
} from '@logto/core';
import { NextFunction, Router as createRouter } from 'express';
import { LogtoRequest, LogtoResponse } from './types.d';
import { requireAuth } from './require-auth';

export { requireAuth };

export function logto(options?: ConfigParameters): createRouter {
  const { authRequired } = ensureBasicOptions(options);
  const router = createRouter();
  router.use(async (request: LogtoRequest, response: LogtoResponse, next: NextFunction) => {
    const token = extractBearerToken(request?.headers?.authorization);
    // TODO 这里似乎可以不获取user
    const user = await validateUser(token);
    const isAuthenticated = () => Boolean(user);
    request.logto = {
      isAuthenticated,
      fetchUserInfo: async () => {
        const user = await validateUser(token);
        return user;
      },
      accessToken: token,
    };
    response.logto = {
      login: async () => {
        // TODO 引导前端进入登陆页面
      },
      logout: async () => {
        // TODO 引导前端进入登出页面
      },
    };
    if (authRequired) {
      router.use(requireAuth);
    }

    next();
  });
  return router;
}
