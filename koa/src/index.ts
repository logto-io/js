import { Context, Next } from "koa";

export interface LogtoKoaOptions {
  strategy?: "bearer";
  unauthorizedHandler?: (ctx: Context) => void;
}

export interface LogtoUser {
  id: string;
}

export interface LogtoEnhancedRequest extends Request {
  user: LogtoUser;
}

const defaultUnauthorizedHandler = (ctx: Context) => {
  ctx.throw(401, 'Unauthorized');
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
  options?: LogtoKoaOptions
): (ctx: Context, next: Next) => void {
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
    ctx: Context,
    next: Next
  ) => {
    if (strategy === "bearer") {
      const { authorization } = ctx.req.headers;
      if (
        !authorization ||
        typeof authorization !== "string" ||
        (!authorization.startsWith("Bearer ") &&
          !authorization.startsWith("bearer "))
      ) {
        unauthorizedHandler(ctx);
        return;
      }
      const token = authorization.substr(7);
      const user = await validateUser(token);
      if (!user) {
        unauthorizedHandler(ctx);
        return;
      }
      ctx.user = user;
    }
    next();
  };
}
