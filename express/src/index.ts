import { Request, Response, NextFunction } from "express";

export interface LogtoExpressOptions {
  strategy?: "bearer";
  unauthorizedHandler?: (res: Response) => void;
}

export interface LogtoUser {
  id: string;
}

export interface LogtoEnhancedRequest extends Request {
  user: LogtoUser;
}

const defaultUnauthorizedHandler = (res: Response) => {
  throw new Error("401: Unauthorized");
};

// 应该从core读取
const validateUser = async (token: string): Promise<LogtoUser> => {
  if (token === "test-user-token") {
    return {
      id: "test-user",
    };
  }
  return null;
};

export default function logto(
  options?: LogtoExpressOptions
): (req: LogtoEnhancedRequest, res: Response, next: NextFunction) => void {
  const {
    strategy = "bearer",
    unauthorizedHandler = defaultUnauthorizedHandler,
  } = options || {};
  if (strategy !== "bearer") {
    throw new Error("Invalid strategy");
  }
  if (typeof unauthorizedHandler !== 'function') {
    throw new Error("Invalid unauthorizedHandler");
  }
  return async (
    req: LogtoEnhancedRequest,
    res: Response,
    next: NextFunction
  ) => {
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
      const token = authorization.substr(7);
      const user = await validateUser(token);
      if (!user) {
        unauthorizedHandler(res);
        return next();
      }
      req.user = user;
    }
    next();
  };
}
