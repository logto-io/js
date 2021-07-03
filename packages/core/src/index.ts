export interface LogtoMiddlewareBasicOptions {
  strategy?: "bearer" | "cookie";
}

export interface LogtoUser {
  id: string;
}

export const validateUser = async (token: string): Promise<LogtoUser> => {
  if (token === "test-user-token") {
    return {
      id: "test-user",
    };
  }
  return null;
};

export const extractBearerToken = (authorization: string): string => {
  if (
    !authorization ||
    typeof authorization !== "string" ||
    (!authorization.startsWith("Bearer ") &&
      !authorization.startsWith("bearer "))
  ) {
    return null;
  }
  const token = authorization.substr(7);
  return token;
};

export const ensureBasicOptions = (
  options?: LogtoMiddlewareBasicOptions
): LogtoMiddlewareBasicOptions => {
  const { strategy = "bearer" } = options || {};
  if (strategy !== "bearer" && strategy !== "cookie") {
    throw new Error("Invalid strategy");
  }
  return {
    strategy,
  };
};
