import { Request } from 'express';

export interface RequestContext {
  isAuthenticated: boolean;
  user?: Record<string, any>;
}

export interface LogtoRequest extends Request {
  logto: RequestContext;
}
