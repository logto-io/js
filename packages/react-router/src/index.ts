import type { GetContextParameters, LogtoConfig } from '@logto/node';
import type { SessionStorage } from 'react-router';

import { makeLogtoAdapter } from './infrastructure/logto/index.js';
import { makeGetContext } from './useCases/getContext/index.js';
import { makeHandleAuthRoutes } from './useCases/handleAuthRoutes/index.js';

type Config = Readonly<LogtoConfig> & {
  readonly baseUrl: string;
};

export const makeLogtoReactRouter = (
  config: Config,
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

export type {
  AccessTokenClaims,
  IdTokenClaims,
  LogtoContext,
  InteractionMode,
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
