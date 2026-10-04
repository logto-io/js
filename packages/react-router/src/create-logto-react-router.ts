import type { MiddlewareFunction, RouterContext, SessionStorage } from 'react-router';
import { createContext } from 'react-router';

import type { AuthRoutes, AuthRoutesOptions } from './auth-routes/auth-routes.js';
import { createAuthRoutes } from './auth-routes/auth-routes.js';
import type { LogtoAuthRequestRuntime } from './auth-routes/request-runtime.js';
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
  authRoutes: (options: AuthRoutesOptions) => AuthRoutes;
}>;

/**
 * Creates a server-side Logto integration for React Router Framework Mode. The middleware relies
 * on the framework response pipeline to persist session changes through `Set-Cookie` headers.
 */
export const createLogtoReactRouter = (
  config: LogtoReactRouterConfig,
  { sessionStorage, sessionCoordinator }: CreateLogtoReactRouterDependencies
): LogtoReactRouter => {
  const { baseUrl, ...logtoConfig } = config;
  const context = createContext<LogtoRequestContext>();
  const requestRuntimeContext = createContext<LogtoAuthRequestRuntime>();
  const coordinator = sessionCoordinator ?? createProcessLocalSessionCoordinator();

  return Object.freeze({
    context,
    middleware: createLogtoMiddleware({
      config: logtoConfig,
      context,
      requestRuntimeContext,
      sessionStorage,
      sessionCoordinator: coordinator,
    }),
    authRoutes: createAuthRoutes({ baseUrl, requestRuntimeContext }),
  });
};
