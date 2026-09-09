import type { LogtoConfig } from '@logto/node';
import type { MiddlewareFunction, RouterContext, Session, SessionStorage } from 'react-router';

import { getCookieHeaderFromRequest } from '../framework/get-cookie-header-from-request.js';
import { makeLogtoClient } from '../infrastructure/logto/create-client.js';
import { createStorage } from '../infrastructure/logto/create-storage.js';
import type { SessionCoordinator } from '../infrastructure/session/index.js';
import { SessionRuntime } from '../infrastructure/session/index.js';

import type { LogtoRequestContext } from './request-context.js';
import { createLogtoRequestContext } from './request-context.js';

type CreateLogtoMiddlewareOptions = Readonly<{
  config: LogtoConfig;
  context: RouterContext<LogtoRequestContext>;
  sessionStorage: SessionStorage;
  sessionCoordinator: SessionCoordinator;
}>;

const appendSessionCookie = (response: Response, cookieHeader: string | undefined) => {
  if (!cookieHeader) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.append('Set-Cookie', cookieHeader);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

const createLogtoRequestClientFactory = (config: LogtoConfig) => (session: Session) =>
  makeLogtoClient(config, createStorage(session))();

export const createLogtoMiddleware = ({
  config,
  context: logtoContext,
  sessionStorage,
  sessionCoordinator,
}: CreateLogtoMiddlewareOptions): MiddlewareFunction<Response> => {
  const createClient = createLogtoRequestClientFactory(config);

  return async ({ request, context }, next) => {
    const runtime = await SessionRuntime.create({
      cookieHeader: getCookieHeaderFromRequest(request) ?? undefined,
      sessionStorage,
      sessionCoordinator,
    });
    context.set(logtoContext, createLogtoRequestContext(runtime, createClient));

    const response = await next();
    const cookieHeader = await runtime.finalize();

    return appendSessionCookie(response, cookieHeader);
  };
};
