import { NextFunction, Response } from 'express';
import createHttpError from 'http-errors';
import { LogtoRequest } from './types.d';

export const requireAuth = (request: LogtoRequest, response: Response, next: NextFunction) => {
  if (!request.logto) {
    next(new Error('req.logto is not found, did you include the logto middleware'));
    return;
  }

  if (!request.logto.isAuthenticated) {
    next(createHttpError(401, 'Authentication is required for this route.'));
    return;
  }

  next();
};