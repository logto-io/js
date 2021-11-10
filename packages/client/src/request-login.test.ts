import { DEFAULT_SCOPE_STRING } from './constants';
import { getLoginUrlWithCodeVerifierAndState } from './request-login';

const BASE_URL = 'http://logto.dev/oidc/auth';
const CLIENT_ID = 'foo';
const REDIRECT_URI = 'http://localhost:3000';

describe('getLoginUrlWithCodeVerifierAndState', () => {
  test('url must start with baseUrl', async () => {
    const { url } = await getLoginUrlWithCodeVerifierAndState({
      baseUrl: BASE_URL,
      clientId: CLIENT_ID,
      scope: DEFAULT_SCOPE_STRING,
      redirectUri: REDIRECT_URI,
    });
    expect(url.startsWith(BASE_URL)).toBeTruthy();
  });

  test('url must contain expected client_id', async () => {
    const { url } = await getLoginUrlWithCodeVerifierAndState({
      baseUrl: BASE_URL,
      clientId: CLIENT_ID,
      scope: DEFAULT_SCOPE_STRING,
      redirectUri: REDIRECT_URI,
    });
    expect(url).toContain(`client_id=${CLIENT_ID}`);
  });

  test('url must contains expected scope', async () => {
    const { url } = await getLoginUrlWithCodeVerifierAndState({
      baseUrl: BASE_URL,
      clientId: CLIENT_ID,
      scope: DEFAULT_SCOPE_STRING,
      redirectUri: REDIRECT_URI,
    });
    expect(url).toContain(`scope=${encodeURI(DEFAULT_SCOPE_STRING)}`);
  });

  test('url must contain expected response_type', async () => {
    const { url } = await getLoginUrlWithCodeVerifierAndState({
      baseUrl: BASE_URL,
      clientId: CLIENT_ID,
      scope: DEFAULT_SCOPE_STRING,
      redirectUri: REDIRECT_URI,
    });
    expect(url).toContain('response_type=code');
  });

  test('url must contain expected redirect_uri', async () => {
    const { url } = await getLoginUrlWithCodeVerifierAndState({
      baseUrl: BASE_URL,
      clientId: CLIENT_ID,
      scope: DEFAULT_SCOPE_STRING,
      redirectUri: REDIRECT_URI,
    });
    expect(url).toContain(`redirect_uri=${encodeURIComponent(REDIRECT_URI)}`);
  });

  test('url must contain expected prompt', async () => {
    const { url } = await getLoginUrlWithCodeVerifierAndState({
      baseUrl: BASE_URL,
      clientId: CLIENT_ID,
      scope: DEFAULT_SCOPE_STRING,
      redirectUri: REDIRECT_URI,
    });
    expect(url).toContain('prompt=consent');
  });

  test('url must contain expected redirect_uri', async () => {
    const { url } = await getLoginUrlWithCodeVerifierAndState({
      baseUrl: BASE_URL,
      clientId: CLIENT_ID,
      scope: DEFAULT_SCOPE_STRING,
      redirectUri: REDIRECT_URI,
    });
    expect(url).toContain(`redirect_uri=${encodeURIComponent(REDIRECT_URI)}`);
  });

  test('url must contain expected code_challenge', async () => {
    const { url } = await getLoginUrlWithCodeVerifierAndState({
      baseUrl: BASE_URL,
      clientId: CLIENT_ID,
      scope: DEFAULT_SCOPE_STRING,
      redirectUri: REDIRECT_URI,
    });
    expect(url.search('code_challenge=[^&=]+')).toBeGreaterThan(0);
  });

  test('url must contain expected code_challenge_method', async () => {
    const { url } = await getLoginUrlWithCodeVerifierAndState({
      baseUrl: BASE_URL,
      clientId: CLIENT_ID,
      scope: DEFAULT_SCOPE_STRING,
      redirectUri: REDIRECT_URI,
    });
    expect(url).toContain('code_challenge_method=S256');
  });

  test('url must contain expected state', async () => {
    const { url } = await getLoginUrlWithCodeVerifierAndState({
      baseUrl: BASE_URL,
      clientId: CLIENT_ID,
      scope: DEFAULT_SCOPE_STRING,
      redirectUri: REDIRECT_URI,
    });
    expect(url.search('state=[^&=]+')).toBeGreaterThan(0);
  });
});
