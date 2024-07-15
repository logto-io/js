import BaseClient from '@logto/client';
import { conditional, trySafe } from '@silverhand/essentials';

import type { GetContextParameters, LogtoContext } from './types.js';

export type { LogtoContext, GetContextParameters } from './types.js';

export type {
  IdTokenClaims,
  LogtoErrorCode,
  LogtoConfig,
  LogtoClientErrorCode,
  Storage,
  StorageKey,
  InteractionMode,
} from '@logto/client';

export {
  LogtoError,
  LogtoRequestError,
  LogtoClientError,
  OidcError,
  Prompt,
  ReservedScope,
  UserScope,
} from '@logto/client';

export default class LogtoNodeBaseClient extends BaseClient {
  getContext = async ({
    getAccessToken,
    resource,
    fetchUserInfo,
    getOrganizationToken,
    organizationId,
  }: GetContextParameters = {}): Promise<LogtoContext> => {
    const isAuthenticated = await this.isAuthenticated();

    if (!isAuthenticated) {
      return {
        isAuthenticated,
      };
    }

    const claims = await this.getIdTokenClaims();

    const { accessToken, accessTokenClaims } = getAccessToken
      ? {
          accessToken: await trySafe(async () => this.getAccessToken(resource, organizationId)),
          accessTokenClaims: await trySafe(async () => this.getAccessTokenClaims(resource)),
        }
      : { accessToken: undefined, accessTokenClaims: undefined };

    if (getAccessToken && !accessToken) {
      // Failed to get access token, the user is not authenticated
      return {
        isAuthenticated: false,
      };
    }

    const organizationTokens = conditional(
      getOrganizationToken &&
        claims.organizations &&
        Object.fromEntries(
          await Promise.all(
            claims.organizations.map(
              async (organizationId): Promise<[string, string]> => [
                organizationId,
                await this.getOrganizationToken(organizationId),
              ]
            )
          )
        )
    );

    return {
      isAuthenticated,
      claims,
      userInfo: conditional(fetchUserInfo && (await trySafe(async () => this.fetchUserInfo()))),
      ...conditional(
        getAccessToken && { accessToken, scopes: accessTokenClaims?.scope?.split(' ') }
      ),
      organizationTokens,
    };
  };
}
