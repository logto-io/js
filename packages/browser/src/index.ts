import type { LogtoConfig } from '@logto/client';
import BaseClient, { createRequester } from '@logto/client';

import { BrowserStorage } from './storage.js';
import { generateCodeChallenge, generateCodeVerifier, generateState } from './utils/generators.js';

export type {
  IdTokenClaims,
  LogtoErrorCode,
  LogtoConfig,
  LogtoClientErrorCode,
  UserInfoResponse,
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

const navigate = (url: string) => {
  window.location.assign(url);
};

export default class LogtoClient extends BaseClient {
  constructor(config: LogtoConfig) {
    const requester = createRequester(fetch);
    super(config, {
      requester,
      navigate,
      storage: new BrowserStorage(config.appId),
      generateCodeChallenge,
      generateCodeVerifier,
      generateState,
    });
  }
}
