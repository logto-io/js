import type { MiddlewareFunction, RouterContext, SessionStorage } from 'react-router';
import { createContext } from 'react-router';

import {
  createProcessLocalSessionCoordinator,
  type SessionCoordinator,
} from './infrastructure/session/index.js';
import { createLogtoMiddleware } from './middleware/create-middleware.js';
import type { LogtoRequestContext } from './middleware/request-context.js';
import type { LogtoReactRouterConfig } from './types.js';

type CreateLogtoReactRouterDependencies = Readonly<{
  sessionStorage: SessionStorage;
  sessionCoordinator?: SessionCoordinator;
}>;

export type LogtoReactRouter = Readonly<{
  context: RouterContext<LogtoRequestContext>;
  middleware: MiddlewareFunction<Response>;
}>;

/**
 * Creates a server-side Logto integration for React Router Framework Mode. The middleware relies
 * on the framework response pipeline to persist session changes through `Set-Cookie` headers.
 */
export const createLogtoReactRouter = (
  config: LogtoReactRouterConfig,
  { sessionStorage, sessionCoordinator }: CreateLogtoReactRouterDependencies
): LogtoReactRouter => {
  const context = createContext<LogtoRequestContext>();
  const coordinator = sessionCoordinator ?? createProcessLocalSessionCoordinator();

  return Object.freeze({
    context,
    middleware: createLogtoMiddleware({
      config,
      context,
      sessionStorage,
      sessionCoordinator: coordinator,
    }),
  });
};
