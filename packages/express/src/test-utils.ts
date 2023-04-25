import cookieParser from 'cookie-parser';
import type { NextFunction, Request, Response, Router } from 'express';
import express from 'express';
import session from 'express-session';
import request from 'supertest';

import type { Middleware } from './index.js';

type TestMiddlewareParameters = {
  middleware: Middleware;
  url?: string;
  test: ({
    response,
    request,
    next,
  }: {
    response: Response;
    request: Request;
    next: NextFunction;
  }) => Promise<void>;
};

export const testMiddleware = async ({ middleware, url, test }: TestMiddlewareParameters) => {
  /* eslint-disable no-restricted-syntax */
  const request = {
    url,
    session: {},
  } as unknown as Request;
  const response = {
    redirect: jest.fn(),
  } as unknown as Response;
  const next = jest.fn() as unknown as NextFunction;
  /* eslint-enable no-restricted-syntax */
  await middleware(request, response, next);
  await test({ request, response, next });
};

export const testRouter = (router: Router) => {
  const app = express();
  app.use(cookieParser());
  app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 14 * 24 * 60 * 60 } }));
  app.use(router);

  return request(app);
};
