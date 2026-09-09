export { createLogtoReactRouter } from './create-logto-react-router.js';
export type { LogtoReactRouter } from './create-logto-react-router.js';

export type {
  AuthRouteAction,
  AuthRouteLoader,
  AuthRoutePaths,
  AuthRoutes,
  AuthRoutesOptions,
  ValidateAuthActionRequest,
} from './auth-routes/auth-routes.js';

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
