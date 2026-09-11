import type { LogtoConfig } from '@logto/client';
import BaseClient from '@logto/client';
import { conditional } from '@silverhand/essentials';

import { CacheStorage } from './cache.js';
import { BrowserStorage } from './storage.js';
import { generateCodeChallenge, generateCodeVerifier, generateState } from './utils/generators.js';

export { createRequester, default as BaseClient } from '@logto/client';
export { generateCodeChallenge, generateCodeVerifier, generateState } from './utils/generators.js';

export type {
  AccessTokenClaims,
  CreateRequesterOptions,
  IdTokenClaims,
  LogtoErrorCode,
  LogtoConfig,
  LogtoClientErrorCode,
  UserInfoResponse,
  InteractionMode,
  ClientAdapter,
  SignInOptions,
  Storage,
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
  decodeAccessToken,
  getOrganizationIdFromUrn,
  CacheKey,
  PersistKey,
  isLogtoRequestError,
} from '@logto/client';

export { BrowserStorage } from './storage.js';

const navigate = (url: string) => {
  window.location.assign(url);
};

export default class LogtoClient extends BaseClient {
  /**
   * @param config The configuration object for the client.
   * @param [unstable_enableCache=false] Whether to enable cache for well-known data.
   * Use sessionStorage by default.
   */
  constructor(config: LogtoConfig, unstable_enableCache = false) {
    super(config, {
      navigate,
      storage: new BrowserStorage(config.appId),
      unstable_cache: conditional(unstable_enableCache && new CacheStorage(config.appId)),
      generateCodeChallenge,
      generateCodeVerifier,
      generateState,
    });
  }
}
