import BaseClient, { LogtoConfig, createRequester, ClientAdapter } from '@logto/client';
import fetch from 'node-fetch';

import { generateCodeChallenge, generateCodeVerifier, generateState } from './utils/generators';

export type {
  IdTokenClaims,
  LogtoErrorCode,
  LogtoConfig,
  LogtoClientErrorCode,
} from '@logto/client';
export { LogtoError, OidcError, Prompt, LogtoRequestError, LogtoClientError } from '@logto/client';

export default class LogtoClient extends BaseClient {
  constructor(config: LogtoConfig, adapter: Pick<ClientAdapter, 'navigate' | 'storage'>) {
    super(config, {
      ...adapter,
      requester: createRequester(fetch),
      generateCodeChallenge,
      generateCodeVerifier,
      generateState,
    });
  }
}
