import BaseClient, { LogtoConfig, LogtoRequestErrorBody, LogtoRequestError } from '@logto/client';

import { BrowserStorage } from './storage';
import { generateCodeChallenge, generateCodeVerifier, generateState } from './utils/generators';

export type {
  IdTokenClaims,
  LogtoErrorCode,
  LogtoRequestErrorBody,
  LogtoConfig,
  LogtoClientErrorCode,
} from '@logto/client';
export { LogtoError, OidcError, Prompt, LogtoRequestError, LogtoClientError } from '@logto/client';

const requester = async <T>(...args: Parameters<typeof fetch>): Promise<T> => {
  const response = await fetch(...args);

  if (!response.ok) {
    // Expected request error from server
    const { code, message } = await response.json<LogtoRequestErrorBody>();
    throw new LogtoRequestError(code, message);
  }

  return response.json<T>();
};

const navigate = (url: string) => {
  window.location.assign(url);
};

export default class LogtoClient extends BaseClient {
  constructor(config: LogtoConfig) {
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
