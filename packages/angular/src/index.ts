export type {
  AccessTokenClaims,
  ClientAdapter,
  IdTokenClaims,
  InteractionMode,
  LogtoClientErrorCode,
  LogtoConfig,
  LogtoErrorCode,
  SignInOptions,
  Storage,
  UserInfoResponse,
} from '@logto/browser';

export {
  BrowserStorage,
  LogtoClientError,
  LogtoError,
  LogtoRequestError,
  OidcError,
  PersistKey,
  Prompt,
  ReservedResource,
  ReservedScope,
  UserScope,
  buildOrganizationUrn,
  getOrganizationIdFromUrn,
  isLogtoRequestError,
  organizationUrnPrefix,
} from '@logto/browser';

export { LOGTO_CLIENT, provideLogto, type LogtoAngularOptions } from './provider.js';
export { LogtoService } from './service.js';
