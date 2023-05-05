import BaseClient from '@logto/client';
import { conditional } from '@silverhand/essentials';

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
  OidcError,
  Prompt,
  LogtoRequestError,
  LogtoClientError,
  ReservedScope,
  UserScope,
} from '@logto/client';

export default class LogtoNodeBaseClient extends BaseClient {
  getContext = async ({
    getAccessToken,
    resource,
    fetchUserInfo,
  }: GetContextParameters = {}): Promise<LogtoContext> => {
    const isAuthenticated = await this.isAuthenticated();

    if (!isAuthenticated) {
      return {
        isAuthenticated,
      };
    }

    const claims = await this.getIdTokenClaims();

    if (!getAccessToken) {
      return {
        isAuthenticated,
        claims,
        userInfo: conditional(fetchUserInfo && (await this.fetchUserInfo())),
      };
    }

    try {
      const accessToken = await this.getAccessToken(resource);

      return {
        isAuthenticated,
        claims: await this.getIdTokenClaims(),
        userInfo: conditional(fetchUserInfo && (await this.fetchUserInfo())),
        accessToken,
      };
    } catch {
      return {
        isAuthenticated: false,
      };
    }
  };
}
