import { DEFAULT_SCOPE_STRING } from './constants';
import { getLoginUrlWithCodeVerifierAndState } from './request-login';

const BASE_URL = 'http://logto.dev/oidc/auth';
const CLIENT_ID = 'foo';
const REDIRECT_URI = 'http://localhost:3000';

describe('getLoginUrlWithCodeVerifierAndState', () => {
  // eslint-disable-next-line @silverhand/fp/no-let
  let loginUrl: string;

  beforeAll(async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    loginUrl = (
      await getLoginUrlWithCodeVerifierAndState({
        baseUrl: BASE_URL,
        clientId: CLIENT_ID,
        scope: DEFAULT_SCOPE_STRING,
        redirectUri: REDIRECT_URI,
      })
    ).url;
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
