import {
  ensureBasicOptions,
  extractBearerToken,
  ConfigParams,
  validateUser,
} from "@logto/middleware";
import { NextFunction, Router } from "express";
import { LogtoRequest, LogtoResponse } from "./types";
import { requireAuth } from './require-auth';

export function logto(
  options?: ConfigParams
): Router {
  const { authRequired } = ensureBasicOptions(options);
  const router = Router();
  router.use(async (req: LogtoRequest, res: LogtoResponse, next: NextFunction) => {
    const token = extractBearerToken(req?.headers?.authorization);
    const isAuthenticated = () => !!token;
    req.logto = {
      isAuthenticated,
      fetchUserInfo: async () => {
        const user = await validateUser(token);
        return user;
      },
      accessToken: token,
    };
    // TODO
    res.logto = {
      login: async () => {},
      logout: async () => {},
    };
    if (authRequired) {
      router.use(requireAuth);
    }
    next();
  });
  return router;
}
