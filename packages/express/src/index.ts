import { ensureBasicOptions, extractBearerToken, LogtoMiddlewareBasicOptions, LogtoUser, validateUser } from '@logto/middleware-core';
import { Request, Response, NextFunction } from "express";

export interface LogtoExpressOptions extends LogtoMiddlewareBasicOptions {
  unauthorizedHandler?: (res: Response) => void;
}

export interface LogtoEnhancedRequest extends Request {
  user: LogtoUser;
}

const defaultUnauthorizedHandler = (res: Response) => {
  throw new Error("401: Unauthorized");
};

export default function logto(
  options?: LogtoExpressOptions
): (req: LogtoEnhancedRequest, res: Response, next: NextFunction) => void {
  const { strategy } = ensureBasicOptions(options);
  const {
    unauthorizedHandler = defaultUnauthorizedHandler,
  } = options || {};
  if (typeof unauthorizedHandler !== 'function') {
    throw new Error("Invalid unauthorizedHandler");
  }
  return async (
    req: LogtoEnhancedRequest,
    res: Response,
    next: NextFunction
  ) => {
    let token: string;
    if (strategy === "bearer") {
      const { authorization } = req.headers;
      if (
        !authorization ||
        typeof authorization !== "string" ||
        (!authorization.startsWith("Bearer ") &&
          !authorization.startsWith("bearer "))
      ) {
        unauthorizedHandler(res);
        return next();
      }
      token = extractBearerToken(req.headers.authorization);
    } else if (strategy === "cookie") {
      if (!req.cookies || !req.cookies.logto_token || typeof req.cookies.logto_token !== 'string') {
        unauthorizedHandler(res);
        return next();
      }
      token = req.cookies.logto_token;
    }
    if (!token) {
      unauthorizedHandler(res);
      return next();
    }
    const user = await validateUser(token);
    if (!user) {
      unauthorizedHandler(res);
      return next();
    }
    req.user = user;
    next();
  };
}
