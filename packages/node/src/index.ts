import BaseClient, { LogtoConfig, createRequester, ClientAdapter } from '@logto/client';
import fetch from 'node-fetch';

import { LogtoContext } from './types';
import { generateCodeChallenge, generateCodeVerifier, generateState } from './utils/generators';

export type { LogtoContext } from './types';

export type {
  IdTokenClaims,
  LogtoErrorCode,
  LogtoConfig,
  LogtoClientErrorCode,
  Storage,
  StorageKey,
} from '@logto/client';
export { LogtoError, OidcError, Prompt, LogtoRequestError, LogtoClientError } from '@logto/client';

export default class LogtoClient extends BaseClient {
  constructor(config: LogtoConfig, adapter: Pick<ClientAdapter, 'navigate' | 'storage'>) {
    super(config, {
      ...adapter,
      requester: createRequester(
        config.appSecret
          ? async (...args: Parameters<typeof fetch>) => {
              const [input, init] = args;

              return fetch(input, {
                ...init,
                headers: {
                  ...init?.headers,

                  authorization: `basic ${Buffer.from(
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    `${config.appId}:${config.appSecret}`,
                    'utf8'
                  ).toString('base64')}`,
                },
              });
            }
          : fetch
      ),
      generateCodeChallenge,
      generateCodeVerifier,
      generateState,
    });
  }

  getContext = async (getAccessToken = false): Promise<LogtoContext> => {
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
      };
    }

    try {
      const accessToken = await this.getAccessToken();

      return {
        isAuthenticated,
        claims: await this.getIdTokenClaims(),
        accessToken,
      };
    } catch {
      return {
        isAuthenticated: false,
      };
    }
  };
}
