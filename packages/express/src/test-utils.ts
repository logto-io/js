import { NextFunction, Request, Response } from 'express';

import { Middleware } from '.';

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
