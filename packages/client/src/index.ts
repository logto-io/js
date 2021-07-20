export interface ConfigParameters {
  authRequired?: boolean;
  baseURL?: string;
  clientID: string;
  issuerBaseURL: string;
  secret: string;
}

export interface UserResponse {
  id: string;
  // TODO 用户信息返回待确定
}

export const validateUser = async (accessToken: string): Promise<UserResponse> => {
  // TODO 替换成真实的校验
  if (accessToken === 'test-user-token') {
    return {
      id: 'test-user',
    };
  }

  return null;
};

export const extractBearerToken = (authorization: string): string => {
  if (
    !authorization ||
    typeof authorization !== 'string' ||
    (!authorization.startsWith('Bearer ') && !authorization.startsWith('bearer '))
  ) {
    return null;
  }

  const token = authorization.slice(7);
  return token;
};

export const ensureBasicOptions = (options?: ConfigParameters): ConfigParameters => {
  const { authRequired = true, baseURL = '/', clientID, issuerBaseURL, secret } = options || {};
  if (typeof issuerBaseURL !== 'string' || issuerBaseURL.length === 0) {
    throw new Error('Invalid issuerBaseURL');
  }

  if (typeof clientID !== 'string' || clientID.length === 0) {
    throw new Error('Need clientId');
  }

  if (typeof secret !== 'string' || secret.length === 0) {
    throw new Error('Need secret');
  }

  return {
    authRequired: Boolean(authRequired),
    baseURL,
    clientID,
    secret,
    issuerBaseURL,
  };
};
