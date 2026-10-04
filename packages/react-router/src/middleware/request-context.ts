import type {
  AccessTokenClaims,
  GetContextParameters,
  IdTokenClaims,
  LogtoContext,
} from '@logto/node';
import type { Session } from 'react-router';

import type { SessionRuntime } from '../infrastructure/session/index.js';

export type GetLogtoContextOptions = Readonly<Pick<GetContextParameters, 'fetchUserInfo'>>;

export type GetAccessTokenOptions = Readonly<{
  resource?: string;
  organizationId?: string;
}>;

export type LogtoAuthenticationContext = Readonly<
  Pick<LogtoContext, 'isAuthenticated' | 'claims' | 'userInfo'>
>;

export type LogtoRequestContext = Readonly<{
  session: Session;
  getContext: (options?: GetLogtoContextOptions) => Promise<LogtoAuthenticationContext>;
  getIdTokenClaims: () => Promise<IdTokenClaims>;
  getAccessToken: (options?: GetAccessTokenOptions) => Promise<string>;
  getAccessTokenClaims: (resource?: string, organizationId?: string) => Promise<AccessTokenClaims>;
  getOrganizationToken: (organizationId: string) => Promise<string>;
  getOrganizationTokenClaims: (organizationId: string) => Promise<AccessTokenClaims>;
  clearAccessToken: () => Promise<void>;
  clearAllTokens: () => Promise<void>;
}>;

type LogtoRequestClient = {
  getContext: (options?: GetContextParameters) => Promise<LogtoContext>;
  getIdTokenClaims: () => Promise<IdTokenClaims>;
  getAccessToken: (resource?: string, organizationId?: string) => Promise<string>;
  getAccessTokenClaims: (resource?: string, organizationId?: string) => Promise<AccessTokenClaims>;
  getOrganizationToken: (organizationId: string) => Promise<string>;
  getOrganizationTokenClaims: (organizationId: string) => Promise<AccessTokenClaims>;
  clearAccessToken: () => Promise<void>;
  clearAllTokens: () => Promise<void>;
};

export type CreateLogtoRequestClient = (session: Session) => LogtoRequestClient;

export const createLogtoRequestContext = (
  runtime: SessionRuntime,
  createClient: CreateLogtoRequestClient
): LogtoRequestContext => {
  const getAccessToken = async ({ resource, organizationId }: GetAccessTokenOptions = {}) =>
    runtime.checkpoint(async (session) =>
      createClient(session).getAccessToken(resource, organizationId)
    );

  const getAccessTokenClaims = async (resource?: string, organizationId?: string) =>
    runtime.checkpoint(async (session) =>
      createClient(session).getAccessTokenClaims(resource, organizationId)
    );

  const getContext = async (options: GetLogtoContextOptions = {}) => {
    const context = await createClient(runtime.session).getContext();

    if (!options.fetchUserInfo || !context.isAuthenticated) {
      return context;
    }

    await getAccessToken();

    return createClient(runtime.session).getContext({ fetchUserInfo: true });
  };

  const getOrganizationToken = async (organizationId: string) =>
    runtime.checkpoint(async (session) =>
      createClient(session).getOrganizationToken(organizationId)
    );

  const getOrganizationTokenClaims = async (organizationId: string) =>
    runtime.checkpoint(async (session) =>
      createClient(session).getOrganizationTokenClaims(organizationId)
    );

  const clearAccessToken = async () =>
    runtime.checkpoint(async (session) => createClient(session).clearAccessToken());

  const clearAllTokens = async () =>
    runtime.checkpoint(async (session) => createClient(session).clearAllTokens());

  return Object.freeze({
    session: runtime.session,
    getContext,
    getIdTokenClaims: async () => createClient(runtime.session).getIdTokenClaims(),
    getAccessToken,
    getAccessTokenClaims,
    getOrganizationToken,
    getOrganizationTokenClaims,
    clearAccessToken,
    clearAllTokens,
  });
};
