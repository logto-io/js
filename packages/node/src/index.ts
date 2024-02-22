import type { LogtoConfig, ClientAdapter, StandardLogtoClient, JwtVerifier } from '@logto/client';
import { createRequester } from '@logto/client';

import { generateCodeChallenge, generateCodeVerifier, generateState } from '../edge/generators.js';

import BaseClient from './client.js';

export type { LogtoContext, GetContextParameters } from './types.js';

export * from './utils/session.js';
export * from './utils/cookie-storage.js';

export type {
  IdTokenClaims,
  LogtoErrorCode,
  LogtoConfig,
  LogtoClientErrorCode,
  Storage,
  StorageKey,
  InteractionMode,
  ClientAdapter,
  JwtVerifier,
  UserInfoResponse,
} from '@logto/client';

export {
  LogtoError,
  LogtoRequestError,
  LogtoClientError,
  OidcError,
  Prompt,
  ReservedScope,
  ReservedResource,
  UserScope,
  organizationUrnPrefix,
  buildOrganizationUrn,
  getOrganizationIdFromUrn,
  PersistKey,
  StandardLogtoClient,
} from '@logto/client';

export default class LogtoClient extends BaseClient {
  constructor(
    config: LogtoConfig,
    adapter: Partial<ClientAdapter> & Pick<ClientAdapter, 'navigate' | 'storage'>,
    buildJwtVerifier?: (client: StandardLogtoClient) => JwtVerifier
  ) {
    super(
      config,
      {
        requester: createRequester(
          config.appSecret
            ? async (...args: Parameters<typeof fetch>) => {
                const [input, init] = args;

                return fetch(input, {
                  ...init,
                  headers: {
                    Authorization: `Basic ${Buffer.from(
                      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                      `${config.appId}:${config.appSecret}`,
                      'utf8'
                    ).toString('base64')}`,
                    ...init?.headers,
                  },
                });
              }
            : fetch
        ),
        generateCodeChallenge,
        generateCodeVerifier,
        generateState,
        ...adapter,
      },
      buildJwtVerifier
    );
  }
}
