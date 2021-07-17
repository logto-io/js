import { Request, Response } from 'express';

export interface RequestContext {
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  // TODO idTokenClaims: any;
  user?: Record<string, any>;
  isAuthenticated: () => boolean;
  // 必要时再获取，一般情况下只需要判断是否登陆
  fetchUserInfo: () => Promise<UserResponse>;
}

export interface ResponseContenxt {
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export interface LogtoRequest extends Request {
  logto: RequestContext;
}

export interface LogtoResponse extends Response {
  logto: ResponseContenxt;
}
