import BaseClient, {
  LogtoConfig,
  LogtoRequestErrorBody,
  LogtoRequestError,
  Storage,
  StorageKey,
} from '@logto/client';
import { Nullable } from '@silverhand/essentials';

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

const logtoStorageItemKeyPrefix = `logto`;

class BrowserStorage implements Storage {
  private readonly storageKey: string;

  constructor(appId: string) {
    this.storageKey = `${logtoStorageItemKeyPrefix}:${appId}`;
  }

  getItem(key: StorageKey): Nullable<string> {
    if (key === 'signInSession') {
      return sessionStorage.getItem(this.storageKey);
    }

    return localStorage.getItem(`${this.storageKey}:${key}`);
  }

  setItem(key: StorageKey, value: string): void {
    if (key === 'signInSession') {
      sessionStorage.setItem(this.storageKey, value);

      return;
    }
    localStorage.setItem(`${this.storageKey}:${key}`, value);
  }

  removeItem(key: StorageKey): void {
    if (key === 'signInSession') {
      sessionStorage.removeItem(this.storageKey);

      return;
    }
    localStorage.removeItem(`${this.storageKey}:${key}`);
  }
}

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
