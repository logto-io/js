import {
  ensureBasicOptions,
  extractBearerToken,
  ConfigParams,
  validateUser,
} from "@logto/middleware";
import { NextFunction, Router } from "express";
import { LogtoRequest, LogtoResponse } from "./types";
import { requireAuth } from "./require-auth";

export { requireAuth };

export function logto(options?: ConfigParams): Router {
  const { authRequired } = ensureBasicOptions(options);
  const router = Router();
  router.use(
    async (req: LogtoRequest, res: LogtoResponse, next: NextFunction) => {
      const token = extractBearerToken(req?.headers?.authorization);
      // TODO 这里似乎可以不获取user
      const user = await validateUser(token);
      const isAuthenticated = () => !!user;
      req.logto = {
        isAuthenticated,
        fetchUserInfo: async () => {
          const user = await validateUser(token);
          return user;
        },
        accessToken: token,
      };
      // TODO 实现快速的登陆/登出（配合客户端sdk）
      res.logto = {
        login: async () => {},
        logout: async () => {},
      };
      if (authRequired) {
        router.use(requireAuth);
      }
      next();
    }
  );
  return router;
}
