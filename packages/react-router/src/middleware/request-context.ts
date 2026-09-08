import type { GetContextParameters, LogtoContext } from '@logto/node';
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
  getAccessToken: (options?: GetAccessTokenOptions) => Promise<string>;
  getOrganizationToken: (organizationId: string) => Promise<string>;
}>;

type LogtoRequestClient = {
  getContext: (options?: GetContextParameters) => Promise<LogtoContext>;
  getAccessToken: (resource?: string, organizationId?: string) => Promise<string>;
  getOrganizationToken: (organizationId: string) => Promise<string>;
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

  return Object.freeze({
    session: runtime.session,
    getContext,
    getAccessToken,
    getOrganizationToken,
  });
};
