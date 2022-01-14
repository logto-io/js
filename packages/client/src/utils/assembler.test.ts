import { DEFAULT_SCOPE_STRING } from '@logto/js';

import { getLoginUrlWithCodeVerifierAndState, getLogoutUrl } from './assembler';

describe('getLoginUrlWithCodeVerifierAndState', () => {
  const BASE_URL = 'http://logto.dev/oidc/auth';
  const CLIENT_ID = 'foo';
  const REDIRECT_URI = 'http://localhost:3000';

  // eslint-disable-next-line @silverhand/fp/no-let
  let loginUrl: string;

  beforeAll(async () => {
    const { url } = await getLoginUrlWithCodeVerifierAndState({
      baseUrl: BASE_URL,
      clientId: CLIENT_ID,
      scope: DEFAULT_SCOPE_STRING,
      redirectUri: REDIRECT_URI,
    });
    // eslint-disable-next-line @silverhand/fp/no-mutation
    loginUrl = url;
  });

  test('loginUrl must start with baseUrl', async () => {
    expect(loginUrl.startsWith(BASE_URL)).toBeTruthy();
  });

  test('loginUrl must contain expected client_id', async () => {
    expect(loginUrl).toContain(`client_id=${CLIENT_ID}`);
  });

  test('loginUrl must contains expected scope', async () => {
    expect(loginUrl).toContain(`scope=${encodeURI(DEFAULT_SCOPE_STRING)}`);
  });

  test('loginUrl must contain expected response_type', async () => {
    expect(loginUrl).toContain('response_type=code');
  });

  test('loginUrl must contain expected redirect_uri', async () => {
    expect(loginUrl).toContain(`redirect_uri=${encodeURIComponent(REDIRECT_URI)}`);
  });

  test('loginUrl must contain expected prompt', async () => {
    expect(loginUrl).toContain('prompt=consent');
  });

  test('loginUrl must contain expected redirect_uri', async () => {
    expect(loginUrl).toContain(`redirect_uri=${encodeURIComponent(REDIRECT_URI)}`);
  });

  test('loginUrl must contain expected code_challenge', async () => {
    expect(loginUrl.search('code_challenge=[^&=]+')).toBeGreaterThan(0);
  });

  test('loginUrl must contain expected code_challenge_method', async () => {
    expect(loginUrl).toContain('code_challenge_method=S256');
  });

  test('loginUrl must contain expected state', async () => {
    expect(loginUrl.search('state=[^&=]+')).toBeGreaterThan(0);
  });
});

describe('getLogoutUrl', () => {
  test('getLogoutUrl', () => {
    const url = getLogoutUrl(
      'http://logto.dev/oidc/session/end',
      'id_token',
      'http://localhost:3000'
    );
    expect(url).toContain('id_token_hint=id_token');
  });
});
