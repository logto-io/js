import type { GetContextParameters } from '@logto/node';
import type { SessionStorage } from 'react-router';

import { makeLogtoAdapter } from './infrastructure/logto/index.js';
import type { LogtoReactRouterConfig } from './types.js';
import { makeGetContext } from './useCases/getContext/index.js';
import { makeHandleAuthRoutes } from './useCases/handleAuthRoutes/index.js';

export const makeLogtoReactRouter = (
  config: LogtoReactRouterConfig,
  deps: {
    sessionStorage: SessionStorage;
  }
) => {
  const { sessionStorage } = deps;

  const { baseUrl } = config;

  const createLogtoAdapter = makeLogtoAdapter(config);

  return Object.freeze({
    handleAuthRoutes: makeHandleAuthRoutes({
      baseUrl,
      createLogtoAdapter,
      sessionStorage,
    }),

    getContext: (dto: GetContextParameters) =>
      makeGetContext(dto, {
        createLogtoAdapter,
        sessionStorage,
      }),
  });
};

export { createLogtoReactRouter } from './create-logto-react-router.js';
export type { LogtoReactRouter } from './create-logto-react-router.js';

export {
  ProcessLocalSessionCoordinator,
  createProcessLocalSessionCoordinator,
  type SessionCoordinator,
} from './infrastructure/session/index.js';
export type {
  GetAccessTokenOptions,
  GetLogtoContextOptions,
  LogtoAuthenticationContext,
  LogtoRequestContext,
} from './middleware/request-context.js';
export type { LogtoReactRouterConfig } from './types.js';

export type {
  AccessTokenClaims,
  FirstScreen,
  IdTokenClaims,
  LogtoContext,
  LogtoErrorCode,
  UserInfoResponse,
} from '@logto/node';

export {
  LogtoError,
  LogtoRequestError,
  LogtoClientError,
  OidcError,
  Prompt,
  ReservedScope,
  UserScope,
  organizationUrnPrefix,
  buildOrganizationUrn,
  getOrganizationIdFromUrn,
  PersistKey,
} from '@logto/node';
