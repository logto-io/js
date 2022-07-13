import BaseClient, { createRequester, LogtoConfig } from '@logto/client';

import { BrowserStorage } from './storage';
import { generateCodeChallenge, generateCodeVerifier, generateState } from './utils/generators';

export type {
  IdTokenClaims,
  LogtoErrorCode,
  LogtoConfig,
  LogtoClientErrorCode,
} from '@logto/client';
export { LogtoError, OidcError, Prompt, LogtoRequestError, LogtoClientError } from '@logto/client';

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
