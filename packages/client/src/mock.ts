import { generateSignInUri, Prompt } from '@logto/js';
import type { Nullable } from '@silverhand/essentials';

import type { Storage } from './adapter.js';
import type { AccessToken, LogtoConfig, LogtoSignInSessionItem } from './index.js';
import LogtoClient from './index.js';

export const appId = 'app_id_value';
export const endpoint = 'https://logto.dev';

export class MockedStorage implements Storage {
  private storage: Record<string, string> = {};

  constructor(values?: Record<string, string>) {
    if (values) {
      this.storage = values;
    }
  }

  public async getItem(key: string) {
    return this.storage[key] ?? null;
  }

  public async setItem(key: string, value: string): Promise<void> {
    this.storage[key] = value;
  }

  public async removeItem(key: string): Promise<void> {
    /* eslint-disable @typescript-eslint/no-dynamic-delete */
    // eslint-disable-next-line @silverhand/fp/no-delete
    delete this.storage[key];
    /* eslint-enable @typescript-eslint/no-dynamic-delete */
  }

  public reset(values: Record<string, string>): void {
    this.storage = values;
  }
}

export const authorizationEndpoint = `${endpoint}/oidc/auth`;
export const userinfoEndpoint = `${endpoint}/oidc/me`;
export const tokenEndpoint = `${endpoint}/oidc/token`;
export const endSessionEndpoint = `${endpoint}/oidc/session/end`;
export const revocationEndpoint = `${endpoint}/oidc/token/revocation`;
export const jwksUri = `${endpoint}/oidc/jwks`;
export const issuer = 'http://localhost:443/oidc';

export const redirectUri = 'http://localhost:3000/callback';
export const postSignOutRedirectUri = 'http://localhost:3000';

export const mockCodeChallenge = 'code_challenge_value';
export const mockedCodeVerifier = 'code_verifier_value';
export const mockedState = 'state_value';

export const mockedSignInUri = generateSignInUri({
  authorizationEndpoint,
  clientId: appId,
  redirectUri,
  codeChallenge: mockCodeChallenge,
  state: mockedState,
});

export const mockedSignInUriWithLoginPrompt = generateSignInUri({
  authorizationEndpoint,
  clientId: appId,
  redirectUri,
  codeChallenge: mockCodeChallenge,
  state: mockedState,
  prompt: Prompt.Login,
});

export const mockedSignUpUri = generateSignInUri({
  authorizationEndpoint,
  clientId: appId,
  redirectUri,
  codeChallenge: mockCodeChallenge,
  state: mockedState,
  interactionMode: 'signUp',
});

export const accessToken = 'access_token_value';
export const refreshToken = 'new_refresh_token_value';
export const idToken = 'id_token_value';

export const currentUnixTimeStamp = Date.now() / 1000;

export const fetchOidcConfig = jest.fn(async () => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

  return {
    authorizationEndpoint,
    tokenEndpoint,
    userinfoEndpoint,
    endSessionEndpoint,
    revocationEndpoint,
    jwksUri,
    issuer,
  };
});

export const requester = jest.fn();
export const failingRequester = jest.fn().mockRejectedValue(new Error('Failed!'));
export const navigate = jest.fn();
export const generateCodeChallenge = jest.fn(async () => mockCodeChallenge);
export const generateCodeVerifier = jest.fn(() => mockedCodeVerifier);
export const generateState = jest.fn(() => mockedState);

export const createAdapters = () => ({
  requester,
  storage: new MockedStorage(),
  navigate,
  generateCodeChallenge,
  generateCodeVerifier,
  generateState,
});

export const createClient = (prompt?: Prompt, storage = new MockedStorage()) =>
  new LogtoClient(
    { endpoint, appId, prompt },
    {
      ...createAdapters(),
      storage,
    }
  );

/**
 * Make LogtoClient.signInSession accessible for test
 */
export class LogtoClientSignInSessionAccessor extends LogtoClient {
  public getLogtoConfig(): Nullable<LogtoConfig> {
    return this.logtoConfig;
  }

  public async getSignInSessionItem(): Promise<Nullable<LogtoSignInSessionItem>> {
    return this.getSignInSession();
  }

  public async setSignInSessionItem(item: Nullable<LogtoSignInSessionItem>): Promise<void> {
    await this.setSignInSession(item);
  }

  public getAccessTokenMap(): Map<string, AccessToken> {
    return this.accessTokenMap;
  }
}
